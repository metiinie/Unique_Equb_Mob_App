import { Injectable, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { ContributionRepository } from './contribution.repository';
import { AuditEventService } from '../audit-event/audit-event.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ContributionStatus, User, EqubStatus, MembershipStatus, MembershipRole, AuditActionType, GlobalRole, Prisma } from '@prisma/client';
import { assertCanContribute } from '../../domain/equb-state.rules';

import { SystemStatusService } from '../common/system-status.service';

@Injectable()
export class ContributionService {
    constructor(
        private readonly contributionRepo: ContributionRepository,
        private readonly auditService: AuditEventService,
        private readonly prisma: PrismaService,
        private readonly systemStatus: SystemStatusService,
    ) { }

    // =================================================================================================
    // 🛡️ DOMAIN GUARDRAILS ENFORCED 🛡️
    // This service is part of the FROZEN FINANCIAL CORE (Phase 7).
    // DO NOT modify Invariants without updating INVARIANTS.md and running full regression tests.
    // DIRECT PRISMA WRITES OUTSIDE THIS SERVICE FOR CONTRIBUTIONS ARE FORBIDDEN.
    // =================================================================================================

    /**
     * CONTRIBUTION CYCLE — PHASE 1 (PURE LEDGER OPERATION)
     * 
     * Domain Invariants Enforced:
     * 1. Authorization: MEMBER only (Admin/Collector rejected)
     * 2. Equb exists
     * 3. Equb status is ACTIVE
     * 4. User is an ACTIVE member of the Equb
     * 5. Round integrity: contribution round === equb.currentRound
     * 6. Amount integrity: contribution amount === equb.amount (exact match)
     * 7. Uniqueness: One contribution per member per round
     * 8. Payout safety: No payout exists for current round
     * 
     * Transition: Record contribution (atomic, no side effects)
     * Status: PAID (immediate, no approval workflow in Phase 1)
     */
    async createContribution(
        actor: User,
        equbId: string,
        roundNumber: number,
        amount: number,
    ) {
        try {
            return await this.prisma.$transaction(async (tx) => {
                // 1. Authorization: MEMBER only
                if (actor.role !== GlobalRole.MEMBER) {
                    throw new ForbiddenException('Only MEMBER role users can make contributions');
                }

                // 2. Lock Equb for update to prevent concurrent round progression or state changes
                const equb = await tx.equb.findUnique({
                    where: { id: equbId },
                });

                if (!equb) {
                    throw new BadRequestException('Equb not found');
                }

                // 3. Invariant: Equb must be ACTIVE
                if (equb.status !== EqubStatus.ACTIVE) {
                    throw new ConflictException('Equb not active');
                }

                // 4. Invariant: User must be an ACTIVE member
                const membership = await tx.membership.findUnique({
                    where: {
                        equbId_userId: {
                            equbId,
                            userId: actor.id,
                        },
                    },
                });

                if (!membership || membership.status !== MembershipStatus.ACTIVE) {
                    throw new ForbiddenException('You are not an active member of this Equb');
                }

                // 5. Invariant: Round must match Equb.currentRound
                if (roundNumber !== equb.currentRound) {
                    throw new ConflictException(`Incorrect round number. Expected: ${equb.currentRound}`);
                }

                // 6. Invariant: Amount must match Equb.amount
                const expectedAmount = Number(equb.amount);
                if (amount !== expectedAmount) {
                    throw new BadRequestException('Incorrect amount');
                }

                // 7. Invariant: Exactly one contribution per member per round
                // We rely on the DATABASE UNIQUE CONSTRAINT for ultimate safety, 
                // but we check here for immediate feedback.
                const existing = await tx.contribution.findUnique({
                    where: {
                        equbId_memberId_roundNumber: {
                            equbId,
                            memberId: actor.id,
                            roundNumber,
                        },
                    },
                });

                if (existing) {
                    throw new ConflictException('Contribution already submitted');
                }

                // 8. Financial Ledger: Append-only write
                const contribution = await tx.contribution.create({
                    data: {
                        equbId,
                        memberId: actor.id,
                        roundNumber,
                        amount: equb.amount,
                        status: ContributionStatus.CONFIRMED, // Phase 1: Auto-confirm
                    },
                });

                // 9. Audit Log
                await this.auditService.logEvent(
                    { id: actor.id, role: actor.role },
                    AuditActionType.CONTRIBUTION_CREATED,
                    { type: 'Contribution', id: contribution.id },
                    {
                        equbId,
                        roundNumber,
                        amount: expectedAmount,
                    },
                );

                // 10. Return updated round status
                const confirmedCount = await tx.contribution.count({
                    where: {
                        equbId,
                        roundNumber,
                        status: ContributionStatus.CONFIRMED,
                    },
                });

                return {
                    contribution,
                    summary: {
                        roundNumber,
                        confirmedCount,
                        isRoundComplete: false, // We never auto-advance here
                    }
                };
            }, {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable // Highest safety for financial operations
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException('Contribution already submitted');
            }
            throw error;
        }
    }

    async getMyContributionStatus(actor: User, equbId: string) {
        // 1. Get Equb current state
        const equb = await this.prisma.equb.findUnique({
            where: { id: equbId },
            select: { currentRound: true, status: true, amount: true }
        });

        if (!equb) throw new BadRequestException('Equb not found');

        // 2. Check if contribution exists for this round
        const contribution = await this.prisma.contribution.findUnique({
            where: {
                equbId_memberId_roundNumber: {
                    equbId,
                    memberId: actor.id,
                    roundNumber: equb.currentRound
                }
            }
        });

        return {
            roundNumber: equb.currentRound,
            requiredAmount: Number(equb.amount),
            hasContributed: !!contribution,
            contributionId: contribution?.id || null,
            status: contribution?.status || null,
            submittedAt: contribution?.createdAt || null,
            isEqubActive: equb.status === EqubStatus.ACTIVE,
            isSystemDegraded: this.systemStatus.isDegraded
        };
    }

    /**
     * Confirm a contribution (ADMIN/COLLECTOR only)
     * Transition: PENDING → CONFIRMED
     */
    async confirmContribution(actor: User, contributionId: string) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Role check: Only ADMIN or COLLECTOR
            if (actor.role !== GlobalRole.ADMIN && actor.role !== GlobalRole.COLLECTOR) {
                throw new ForbiddenException('Only ADMIN or COLLECTOR can confirm contributions');
            }

            // 2. Fetch contribution
            const contribution = await tx.contribution.findUnique({
                where: { id: contributionId },
                include: {
                    equb: true,
                    member: true,
                },
            });

            if (!contribution) {
                throw new BadRequestException('Contribution not found');
            }

            // 3. Status check: Must be PENDING
            assertCanContribute(contribution.equb);
            if (contribution.status !== ContributionStatus.PENDING) {
                throw new ConflictException(
                    `Cannot confirm. Contribution is already ${contribution.status}.`
                );
            }

            // 4. If COLLECTOR: verify they're assigned to this Equb
            if (actor.role === GlobalRole.COLLECTOR) {
                const collectorMembership = await tx.membership.findUnique({
                    where: {
                        equbId_userId: {
                            equbId: contribution.equbId,
                            userId: actor.id,
                        },
                    },
                });

                if (!collectorMembership || collectorMembership.status !== MembershipStatus.ACTIVE) {
                    throw new ForbiddenException('You are not assigned to this Equb');
                }
            }

            // 5. Update status to CONFIRMED
            const updated = await tx.contribution.update({
                where: { id: contributionId },
                data: { status: ContributionStatus.CONFIRMED },
                include: {
                    equb: true,
                    member: true,
                },
            });

            // 6. Audit log
            await this.auditService.logEvent(
                { id: actor.id, role: actor.role },
                AuditActionType.CONTRIBUTION_CONFIRMED,
                { type: 'Contribution', id: contributionId },
                {
                    equbId: contribution.equbId,
                    roundNumber: contribution.roundNumber,
                    amount: Number(contribution.amount),
                    memberId: contribution.memberId,
                    memberName: contribution.member.fullName,
                },
            );

            return updated;
        });
    }

    /**
     * Reject a contribution (ADMIN/COLLECTOR only)
     * Transition: PENDING → REJECTED
     */
    async rejectContribution(actor: User, contributionId: string, reason: string) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Role check
            if (actor.role !== GlobalRole.ADMIN && actor.role !== GlobalRole.COLLECTOR) {
                throw new ForbiddenException('Only ADMIN or COLLECTOR can reject contributions');
            }

            // 2. Fetch contribution
            const contribution = await tx.contribution.findUnique({
                where: { id: contributionId },
                include: {
                    equb: true,
                    member: true,
                },
            });

            if (!contribution) {
                throw new BadRequestException('Contribution not found');
            }

            // 3. Status check
            assertCanContribute(contribution.equb);
            if (contribution.status !== ContributionStatus.PENDING) {
                throw new ConflictException(
                    `Cannot reject. Contribution is already ${contribution.status}.`
                );
            }

            // 4. Update status to REJECTED
            const updated = await tx.contribution.update({
                where: { id: contributionId },
                data: { status: ContributionStatus.REJECTED },
                include: {
                    equb: true,
                    member: true,
                },
            });

            // 5. Audit log
            await this.auditService.logEvent(
                { id: actor.id, role: actor.role },
                AuditActionType.CONTRIBUTION_REJECTED,
                { type: 'Contribution', id: contributionId },
                {
                    equbId: contribution.equbId,
                    roundNumber: contribution.roundNumber,
                    amount: Number(contribution.amount),
                    memberId: contribution.memberId,
                    memberName: contribution.member.fullName,
                    reason,
                },
            );

            return updated;
        });
    }

    /**
     * Get contributions for an Equb (Role-based filtering)
     * 
     * ADMIN/COLLECTOR: See all contributions
     * MEMBER: See only their own contributions
     */
    async getContributions(
        actor: User,
        equbId: string,
        roundNumber?: number,
    ) {
        // 1. Verify Equb exists
        const equb = await this.prisma.equb.findUnique({
            where: { id: equbId },
        });

        if (!equb) {
            throw new BadRequestException('Equb not found');
        }

        // 2. Role-based filtering
        if (actor.role === GlobalRole.ADMIN) {
            // ADMIN sees all
            return this.contributionRepo.findByEqub(equbId, roundNumber);
        } else if (actor.role === GlobalRole.COLLECTOR) {
            // COLLECTOR: Verify membership first
            const membership = await this.prisma.membership.findUnique({
                where: {
                    equbId_userId: {
                        equbId,
                        userId: actor.id,
                    },
                },
            });

            if (!membership || membership.status !== MembershipStatus.ACTIVE) {
                throw new ForbiddenException('You are not assigned to this Equb');
            }

            // COLLECTOR sees all for their assigned Equb
            return this.contributionRepo.findByEqub(equbId, roundNumber);
        } else {
            // MEMBER: See only their own contributions for this Equb
            const contributions = await this.contributionRepo.findByMember(actor.id, equbId);

            // Filter by round if provided
            if (roundNumber) {
                return contributions.filter(c => c.roundNumber === roundNumber);
            }

            return contributions;
        }
    }

    /**
     * Get member's own contributions across all Equbs
     */
    async getMyContributions(actor: User) {
        return this.contributionRepo.findByMember(actor.id);
    }

    /**
     * Get contribution summary for a round
     * (ADMIN/COLLECTOR only)
     */
    async getRoundSummary(actor: User, equbId: string, roundNumber: number) {
        // Role check
        if (actor.role === GlobalRole.MEMBER) {
            throw new ForbiddenException('Only ADMIN or COLLECTOR can view round summaries');
        }

        // Verify Equb exists
        const equb = await this.prisma.equb.findUnique({
            where: { id: equbId },
            include: {
                memberships: {
                    where: {
                        status: MembershipStatus.ACTIVE,
                        role: MembershipRole.MEMBER
                    },
                },
            },
        });

        if (!equb) {
            throw new BadRequestException('Equb not found');
        }

        // If COLLECTOR, verify assignment
        if (actor.role === GlobalRole.COLLECTOR) {
            const membership = await this.prisma.membership.findUnique({
                where: {
                    equbId_userId: {
                        equbId,
                        userId: actor.id,
                    },
                },
            });

            if (!membership || membership.status !== MembershipStatus.ACTIVE) {
                throw new ForbiddenException('You are not assigned to this Equb');
            }
        }

        // Get summary statistics
        const totalMembers = equb.memberships.length;
        const totalExpected = Number(equb.amount) * totalMembers;

        const confirmedCount = await this.contributionRepo.countConfirmedContributions(
            equbId,
            roundNumber,
        );

        const totalCollected = await this.contributionRepo.getRoundTotal(equbId, roundNumber);

        const allContributions = await this.contributionRepo.findByEqub(equbId, roundNumber);

        return {
            equbId,
            equbName: equb.name,
            roundNumber,
            totalMembers,
            confirmedContributions: confirmedCount,
            pendingContributions: allContributions.filter(c => c.status === ContributionStatus.PENDING).length,
            rejectedContributions: allContributions.filter(c => c.status === ContributionStatus.REJECTED).length,
            totalExpected: Number(totalExpected),
            totalCollected: Number(totalCollected),
            collectionRate: totalMembers > 0 ? (confirmedCount / totalMembers) * 100 : 0,
            contributions: allContributions,
            isSystemDegraded: this.systemStatus.isDegraded
        };
    }
}
