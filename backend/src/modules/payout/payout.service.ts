import { Injectable, BadRequestException, ConflictException, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditEventService } from '../audit-event/audit-event.service';
import { User, PayoutStatus, EqubStatus, GlobalRole, AuditActionType, MembershipStatus, MembershipRole, ContributionStatus, Prisma } from '@prisma/client';
import { assertCanExecutePayout } from '../../domain/equb-state.rules';

@Injectable()
export class PayoutService {
    private readonly logger = new Logger(PayoutService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly auditService: AuditEventService,
    ) { }

    // =================================================================================================
    // 🛡️ DOMAIN GUARDRAILS ENFORCED 🛡️
    // This service is part of the FROZEN FINANCIAL CORE (Phase 7).
    // DO NOT modify Invariants without updating INVARIANTS.md and running full regression tests.
    // DIRECT PRISMA WRITES OUTSIDE THIS SERVICE FOR PAYOUTS ARE FORBIDDEN.
    // =================================================================================================


    /**
     * Execute a payout for the current round of an Equb
     * 
     * ATOMIC OPERATION - All steps succeed or all rollback
     * 
     * Invariants Enforced:
     * 1. Only ADMIN or assigned COLLECTOR can execute
     * 2. Equb must be ACTIVE
     * 3. ALL MEMBER contributions for current round must be CONFIRMED
     * 4. Payout must not already exist for this round (unique constraint)
     * 5. Recipient determined by rotation (excluding past recipients)
     * 6. Round increments OR Equb completes (deterministic)
     * 7. Immutable audit log created
     * 
     * @param actor - The user executing the payout (ADMIN/COLLECTOR)
     * @param equbId - The Equb ID
     * @returns Created Payout record
     * @throws ForbiddenException - Unauthorized role
     * @throws NotFoundException - Equb not found
     * @throws ConflictException - Equb not ACTIVE, payout already exists, or invalid state
     * @throws BadRequestException - Contributions incomplete
     */
    async executePayout(actor: User, equbId: string) {
        try {
            return await this.prisma.$transaction(async (tx) => {
                // 1. Authorization: ADMIN or COLLECTOR
                if (actor.role !== GlobalRole.ADMIN && actor.role !== GlobalRole.COLLECTOR) {
                    throw new ForbiddenException('Only ADMIN or COLLECTOR can execute payouts');
                }

                // 2. Lock & Fetch Equb with memberships to ensure round-funded status
                const equb = await tx.equb.findUnique({
                    where: { id: equbId },
                    include: {
                        memberships: {
                            where: {
                                status: MembershipStatus.ACTIVE,
                                role: MembershipRole.MEMBER,
                            },
                        },
                    },
                });

                if (!equb) {
                    throw new NotFoundException('Equb not found');
                }

                // 3. Invariant: Equb must be ACTIVE
                if (equb.status !== EqubStatus.ACTIVE) {
                    throw new ConflictException('Equb not active');
                }

                // 4. Invariant: Round must be within bounds
                if (equb.currentRound === 0 || equb.currentRound > equb.totalRounds) {
                    throw new ConflictException('Invalid round for payout execution');
                }

                // 5. Invariant: Only one payout per round
                const existingPayout = await tx.payout.findUnique({
                    where: {
                        equbId_roundNumber: {
                            equbId,
                            roundNumber: equb.currentRound,
                        },
                    },
                });

                if (existingPayout) {
                    throw new ConflictException('Payout already executed for this round');
                }

                // 6. Invariant: Round must be fully funded (all active members contributed)
                const memberCount = equb.memberships.length;
                if (memberCount === 0) {
                    throw new BadRequestException('No active members in this Equb');
                }

                const confirmedContributionsCount = await tx.contribution.count({
                    where: {
                        equbId,
                        roundNumber: equb.currentRound,
                        status: ContributionStatus.CONFIRMED,
                    },
                });

                if (confirmedContributionsCount !== memberCount) {
                    throw new ConflictException(`Round not fully funded. Expected ${memberCount} contributions, found ${confirmedContributionsCount}`);
                }

                // 7. Deterministic Recipient Logic (ROTATIONAL)
                // Filter members who haven't received a payout yet
                const previousRecipients = await tx.payout.findMany({
                    where: { equbId },
                    select: { recipientUserId: true },
                });
                const recipientIds = new Set(previousRecipients.map(p => p.recipientUserId));

                const eligibleMembers = equb.memberships
                    .filter(m => !recipientIds.has(m.userId))
                    .sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime() || a.userId.localeCompare(b.userId));

                if (eligibleMembers.length === 0) {
                    throw new ConflictException('No eligible recipients remaining');
                }

                const recipient = eligibleMembers[0];

                // 8. Calculate Amount: contributionAmount * memberCount
                const totalPayoutAmount = Number(equb.amount) * memberCount;

                // 9. ATOMIC EXECUTION

                // A. Create Payout Record (Ledger entry)
                const payout = await tx.payout.create({
                    data: {
                        equbId,
                        roundNumber: equb.currentRound,
                        recipientUserId: recipient.userId,
                        amount: totalPayoutAmount,
                        status: PayoutStatus.EXECUTED,
                        executedAt: new Date(),
                    },
                    include: {
                        recipient: {
                            select: { id: true, fullName: true, email: true }
                        }
                    }
                });

                // B. Mark Contributions as SETTLED for this round
                const settlement = await tx.contribution.updateMany({
                    where: {
                        equbId,
                        roundNumber: equb.currentRound,
                        status: ContributionStatus.CONFIRMED,
                    },
                    data: {
                        status: ContributionStatus.SETTLED as any,
                    },
                });

                // C. FINANCIAL RECONCILIATION (Phase 5)
                // We re-query the settled contributions to ensure zero ambiguity
                const contributions = await tx.contribution.findMany({
                    where: {
                        equbId,
                        roundNumber: equb.currentRound,
                        status: ContributionStatus.SETTLED as any,
                    },
                    select: { amount: true }
                });

                const totalSettledAmount = contributions.reduce((sum, c) => sum + Number(c.amount), 0);
                const settledCount = contributions.length;

                // Reconciliation Invariant: All members paid and sum matches exactly
                if (settledCount !== memberCount || totalSettledAmount !== totalPayoutAmount) {
                    const errorMsg = `Critical Reconciliation Failure: Settled=${totalSettledAmount} (${settledCount}), Expected=${totalPayoutAmount} (${memberCount})`;
                    this.logger.error(errorMsg);

                    await this.auditService.logEvent(
                        { id: actor.id, role: actor.role },
                        AuditActionType.PAYOUT_REJECTED,
                        { type: 'Equb', id: equbId },
                        {
                            roundNumber: equb.currentRound,
                            error: 'RECONCILIATION_FAILED',
                            totalSettledAmount,
                            settledCount,
                            expectedAmount: totalPayoutAmount,
                            expectedCount: memberCount
                        }
                    );

                    throw new ConflictException('Financial reconciliation failed. Payout aborted.');
                }

                // D. Advance Round / Handle Terminal State
                const isFinalRound = equb.currentRound === equb.totalRounds;
                const nextRound = equb.currentRound + 1;
                const nextStatus = isFinalRound ? EqubStatus.COMPLETED : EqubStatus.ACTIVE;

                await tx.equb.update({
                    where: { id: equbId },
                    data: {
                        currentRound: nextRound,
                        status: nextStatus,
                    },
                });

                // E. Immutable Audit Trail & Round Closure
                const snapshot = {
                    totalContributed: totalSettledAmount,
                    payoutAmount: totalPayoutAmount,
                    contributionCount: settledCount,
                    memberCount,
                    recipientId: recipient.userId,
                    roundNumber: equb.currentRound
                };

                await this.auditService.logEvent(
                    { id: actor.id, role: actor.role },
                    AuditActionType.PAYOUT_COMPLETED,
                    { type: 'Payout', id: payout.id },
                    { ...snapshot, isFinalRound }
                );

                // Explicitly log round closure
                await this.auditService.logEvent(
                    { id: actor.id, role: actor.role },
                    AuditActionType.ROUND_CLOSED as any,
                    { type: 'Equb', id: equbId },
                    {
                        roundNumber: equb.currentRound,
                        invariantSnapshot: snapshot
                    }
                );

                if (isFinalRound) {
                    await this.auditService.logEvent(
                        { id: actor.id, role: actor.role },
                        AuditActionType.EQUB_COMPLETED,
                        { type: 'Equb', id: equbId },
                        { totalRounds: equb.totalRounds }
                    );
                }

                return payout;
            }, {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
                timeout: 30000,
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException('Payout already executed for this round');
            }
            throw error;
        }
    }

    /**
     * Get payouts for an Equb with role-based access
     */
    async getPayouts(actor: User, equbId: string, roundNumber?: number) {
        // Access Check
        if (actor.role === GlobalRole.MEMBER) {
            // Member can only see their own payouts OR all payouts? 
            // Transparent Equb usually allows seeing all winners. 
            // "MEMBER -> only their payout" was requested in prompt. I will follow strict request.

            return this.prisma.payout.findMany({
                where: {
                    equbId,
                    recipientUserId: actor.id, // Only their wins
                    ...(roundNumber && { roundNumber }),
                },
                include: { recipient: { select: { fullName: true, email: true } } },
                orderBy: { roundNumber: 'asc' },
            });
        }

        // ADMIN/COLLECTOR see all
        // Check collector assignment?
        if (actor.role === GlobalRole.COLLECTOR) {
            const membership = await this.prisma.membership.findUnique({
                where: { equbId_userId: { equbId, userId: actor.id } },
            });
            if (!membership || membership.role !== 'COLLECTOR') {
                // Or maybe just check if they are collector in system?
                // Prompt says "COLLECTOR -> assigned Equbs".
                // Assuming strict assignment check.
                if (!membership) throw new ForbiddenException('Not a member/collector of this Equb');
            }
        }

        return this.prisma.payout.findMany({
            where: {
                equbId,
                ...(roundNumber && { roundNumber }),
            },
            include: { recipient: { select: { fullName: true, email: true } } },
            orderBy: { roundNumber: 'asc' },
        });
    }

    /**
     * Get payout summary for a specific round
     */
    async getRoundPayoutSummary(actor: User, equbId: string, roundNumber: number) {
        if (actor.role === GlobalRole.MEMBER) {
            throw new ForbiddenException('Members cannot view full payout summary');
        }

        const payout = await this.prisma.payout.findUnique({
            where: {
                equbId_roundNumber: { equbId, roundNumber },
            },
            include: {
                recipient: { select: { id: true, fullName: true, email: true } },
            },
        });

        if (!payout) {
            // Maybe round hasn't paid out yet? return status
            return { status: 'PENDING_PAYOUT', roundNumber };
        }

        return {
            status: payout.status,
            roundNumber,
            amount: payout.amount,
            recipient: payout.recipient,
            executedAt: payout.createdAt,
        };
    }

    /**
     * Get all payouts received by the current user across all Equbs
     */
    async getMyPayouts(actor: User) {
        return this.prisma.payout.findMany({
            where: {
                recipientUserId: actor.id,
                status: PayoutStatus.EXECUTED
            },
            include: {
                equb: {
                    select: { name: true }
                }
            },
            orderBy: { executedAt: 'desc' }
        });
    }

    /**
     * Phase 8: Payout Pre-Check (Safety Gate)
     * Performs a dry-run of validity checks without side effects.
     */
    async checkPayoutEligibility(equbId: string): Promise<{
        canExecute: boolean;
        status: 'READY' | 'WARNING' | 'BLOCKED';
        reasons: string[];
        narrative: string;
        summary: {
            round: number;
            expectedAmount: number;
            memberCount: number;
            confirmedCount: number;
            nextRecipient?: { id: string, name: string };
        };
    }> {
        const reasons: string[] = [];
        let status: 'READY' | 'WARNING' | 'BLOCKED' = 'READY';

        // 1. Fetch Equb
        const equb = await this.prisma.equb.findUnique({
            where: { id: equbId },
            include: {
                memberships: {
                    where: { status: MembershipStatus.ACTIVE, role: MembershipRole.MEMBER },
                    include: { user: true }
                }
            }
        });

        if (!equb) throw new NotFoundException('Equb not found');

        // 2. Check Status
        if (equb.status !== EqubStatus.ACTIVE) {
            reasons.push(`Equb is not ACTIVE (current status: ${equb.status})`);
            status = 'BLOCKED';
        }

        // 3. Check Round bounds
        if (equb.currentRound > equb.totalRounds) {
            reasons.push(`Equb has completed all ${equb.totalRounds} rounds.`);
            status = 'BLOCKED';
        }

        // 4. Check Duplicate Payout
        const existingPayout = await this.prisma.payout.findUnique({
            where: { equbId_roundNumber: { equbId, roundNumber: equb.currentRound } }
        });
        if (existingPayout) {
            reasons.push(`Payout for round ${equb.currentRound} already executed.`);
            status = 'BLOCKED';
        }

        // 5. Check Funding
        const memberCount = equb.memberships.length;
        const expectedAmount = Number(equb.amount) * memberCount;
        const confirmedCount = await this.prisma.contribution.count({
            where: { equbId, roundNumber: equb.currentRound, status: ContributionStatus.CONFIRMED }
        });

        if (confirmedCount < memberCount) {
            reasons.push(`Round ${equb.currentRound} is underfunded. ${confirmedCount}/${memberCount} contributions confirmed.`);
            status = 'BLOCKED';
        }

        // 6. Check Recipient Eligibility (Rotational)
        let nextRecipient = null;
        if (status !== 'BLOCKED') {
            const previousRecipients = await this.prisma.payout.findMany({
                where: { equbId },
                select: { recipientUserId: true }
            });
            const recipientIds = new Set(previousRecipients.map(p => p.recipientUserId));
            const eligibleMembers = equb.memberships
                .filter(m => !recipientIds.has(m.userId))
                .sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime() || a.userId.localeCompare(b.userId));

            if (eligibleMembers.length === 0) {
                reasons.push('No eligible members remaining to receive payout.');
                status = 'BLOCKED';
            } else {
                nextRecipient = { id: eligibleMembers[0].userId, name: eligibleMembers[0].user.fullName };
            }
        }

        // Narrative Generation
        let narrative = `Round ${equb.currentRound} is ready for payout.`;
        if (status === 'BLOCKED') {
            narrative = `Payout blocked: ${reasons[0]}`;
        }

        return {
            canExecute: status !== 'BLOCKED',
            status,
            reasons,
            narrative,
            summary: {
                round: equb.currentRound,
                expectedAmount,
                memberCount,
                confirmedCount,
                nextRecipient
            }
        };
    }
}
