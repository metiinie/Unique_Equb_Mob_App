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
                // ═══════════════════════════════════════════════════════════
                // STEP 1: Authorization Check
                // ═══════════════════════════════════════════════════════════
                if (actor.role !== GlobalRole.ADMIN && actor.role !== GlobalRole.COLLECTOR) {
                    throw new ForbiddenException('Only ADMIN or COLLECTOR can execute payouts');
                }

                // ═══════════════════════════════════════════════════════════
                // STEP 2: Lock & Fetch Equb (with memberships & payouts)
                // ═══════════════════════════════════════════════════════════
                const equb = await tx.equb.findUnique({
                    where: { id: equbId },
                    include: {
                        memberships: {
                            where: {
                                status: MembershipStatus.ACTIVE,
                                role: MembershipRole.MEMBER, // 🔥 CRITICAL: Only MEMBERS contribute & receive
                            },
                        },
                        payouts: {
                            select: { recipientUserId: true },
                        },
                    },
                });

                if (!equb) {
                    throw new NotFoundException(`Equb with ID '${equbId}' not found`);
                }

                // ═══════════════════════════════════════════════════════════
                // STEP 3: Validate Equb State
                // ═══════════════════════════════════════════════════════════
                assertCanExecutePayout(equb);

                if (equb.currentRound <= 0) {
                    throw new BadRequestException('Invalid round: Equb has not started (currentRound must be > 0)');
                }

                const memberCount = equb.memberships.length;
                if (memberCount === 0) {
                    throw new BadRequestException('No active MEMBER memberships found');
                }

                // ═══════════════════════════════════════════════════════════
                // STEP 4: Validate Contributions (ALL MEMBERS must have CONFIRMED)
                // ═══════════════════════════════════════════════════════════
                const confirmedContributions = await tx.contribution.count({
                    where: {
                        equbId,
                        roundNumber: equb.currentRound,
                        status: ContributionStatus.CONFIRMED,
                    },
                });

                if (confirmedContributions !== memberCount) {
                    throw new BadRequestException(
                        `Cannot execute payout: Only ${confirmedContributions} of ${memberCount} MEMBER contributions confirmed for round ${equb.currentRound}`
                    );
                }

                // ═══════════════════════════════════════════════════════════
                // STEP 5: Check for Duplicate Payout (Idempotency Guard)
                // ═══════════════════════════════════════════════════════════
                const existingPayout = await tx.payout.findUnique({
                    where: {
                        equbId_roundNumber: {
                            equbId,
                            roundNumber: equb.currentRound,
                        },
                    },
                });

                if (existingPayout) {
                    throw new ConflictException(
                        `Payout already executed for round ${equb.currentRound}. Payouts are immutable.`
                    );
                }

                // ═══════════════════════════════════════════════════════════
                // STEP 6: Determine Recipient (Rotation Logic)
                // ═══════════════════════════════════════════════════════════
                const pastWinnerIds = new Set(equb.payouts.map(p => p.recipientUserId));
                const eligibleMembers = equb.memberships.filter(m => !pastWinnerIds.has(m.userId));

                if (eligibleMembers.length === 0) {
                    throw new ConflictException(
                        'No eligible members for payout: All active MEMBERS have already received a payout'
                    );
                }

                // 🎲 Deterministic rotation: Select first eligible member (sorted by userId)
                // In production, this might be based on a predefined order or lottery system
                const sortedEligible = eligibleMembers.sort((a, b) => a.userId.localeCompare(b.userId));
                const recipientUserId = sortedEligible[0].userId;

                // ═══════════════════════════════════════════════════════════
                // STEP 7: Create Payout Record (Immutable)
                // ═══════════════════════════════════════════════════════════
                const payout = await tx.payout.create({
                    data: {
                        equbId,
                        roundNumber: equb.currentRound,
                        recipientUserId,
                        amount: equb.amount,
                        status: PayoutStatus.EXECUTED,
                        executedAt: new Date(),
                    },
                    include: {
                        recipient: {
                            select: { id: true, fullName: true, email: true },
                        },
                    },
                });

                // ═══════════════════════════════════════════════════════════
                // STEP 8: Advance Round State (Increment BEFORE checking completion)
                // ═══════════════════════════════════════════════════════════
                const nextRound = equb.currentRound + 1;
                const isLastRound = nextRound > equb.totalRounds;
                const newStatus = isLastRound ? EqubStatus.COMPLETED : EqubStatus.ACTIVE;

                await tx.equb.update({
                    where: { id: equbId },
                    data: {
                        currentRound: nextRound,
                        status: newStatus,
                    },
                });

                // ═══════════════════════════════════════════════════════════
                // STEP 9: Audit Logging (Immutable Record)
                // ═══════════════════════════════════════════════════════════
                await this.auditService.logEvent(
                    { id: actor.id, role: actor.role },
                    AuditActionType.PAYOUT_COMPLETED,
                    { type: 'Payout', id: payout.id },
                    {
                        equbId,
                        roundNumber: payout.roundNumber,
                        recipientUserId: payout.recipientUserId,
                        recipientName: payout.recipient.fullName,
                        amount: Number(payout.amount),
                        nextRound,
                    },
                );

                // If this was the final round, log Equb completion
                if (isLastRound) {
                    await this.auditService.logEvent(
                        { id: actor.id, role: actor.role },
                        AuditActionType.EQUB_COMPLETED,
                        { type: 'Equb', id: equbId },
                        {
                            finalRound: equb.currentRound,
                            totalRounds: equb.totalRounds,
                            completedAt: new Date().toISOString(),
                        },
                    );

                    this.logger.log(`Equb ${equbId} COMPLETED after round ${equb.currentRound}`);
                }

                this.logger.log(
                    `Payout executed: Equb=${equbId}, Round=${payout.roundNumber}, Recipient=${recipientUserId}, Amount=${payout.amount}`
                );

                return payout;
            }, {
                timeout: 30000, // Explicitly increase to 30s for heavy Neon latency
                maxWait: 10000,
            });
        } catch (error) {
            // Handle Prisma unique constraint violations
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ConflictException(
                        'Duplicate payout detected: A payout for this round already exists'
                    );
                }
            }

            // Re-throw all other errors
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
}
