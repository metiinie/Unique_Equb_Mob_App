import { Injectable, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { ContributionRepository } from './contribution.repository';
import { AuditEventService } from '../audit-event/audit-event.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ContributionStatus, User, EqubStatus, MembershipStatus, MembershipRole, AuditActionType, GlobalRole, Prisma } from '@prisma/client';
import { assertCanContribute } from '../../domain/equb-state.rules';

@Injectable()
export class ContributionService {
    constructor(
        private readonly contributionRepo: ContributionRepository,
        private readonly auditService: AuditEventService,
        private readonly prisma: PrismaService,
    ) { }

    /**
     * Create a new contribution (Append-Only Ledger)
     * 
     * Rules Enforced:
     * 1. Only ACTIVE Equbs accept contributions
     * 2. Only MEMBER role users can contribute
     * 3. Only one contribution per member per round
     * 4. Contribution amount must match Equb.amount
     * 5. Member must be an ACTIVE member of the Equb
     * 6. Race conditions handled via unique constraint
     */
    async createContribution(
        actor: User,
        equbId: string,
        amount: number,
    ) {
        try {
            return await this.prisma.$transaction(async (tx) => {
                // 1. Role Invariant: Only MEMBERs can contribute
                if (actor.role !== GlobalRole.MEMBER) {
                    throw new ForbiddenException('Only MEMBER role users can make contributions');
                }

                // 2. Fetch Equb inside transaction (snapshot read)
                const equb = await tx.equb.findUnique({
                    where: { id: equbId },
                });

                if (!equb) {
                    throw new BadRequestException('Equb not found');
                }

                // 3. State Invariant: Equb must be ACTIVE
                assertCanContribute(equb);

                // 4. Round Validation: currentRound must be valid
                if (equb.currentRound <= 0 || equb.currentRound > equb.totalRounds) {
                    throw new BadRequestException('Invalid round number');
                }

                // 5. Amount Invariant: Amount must match Equb.amount exactly
                const expectedAmount = Number(equb.amount);
                if (amount !== expectedAmount) {
                    throw new BadRequestException(
                        `Invalid contribution amount. Expected: ${expectedAmount}, Received: ${amount}`
                    );
                }

                // 6. Membership Invariant: User must be an ACTIVE member
                const membership = await tx.membership.findUnique({
                    where: {
                        equbId_userId: {
                            equbId,
                            userId: actor.id,
                        },
                    },
                });

                if (!membership) {
                    throw new ForbiddenException('You are not a member of this Equb');
                }

                if (membership.status !== MembershipStatus.ACTIVE) {
                    throw new ConflictException(
                        `Cannot contribute. Membership status is ${membership.status}. Only ACTIVE members can contribute.`
                    );
                }

                // 7. Duplicate Check: Ensure no contribution exists for this member in current round
                const existing = await tx.contribution.findUnique({
                    where: {
                        // Schema uses 'memberId' in composite key: equbId_memberId_roundNumber
                        equbId_memberId_roundNumber: {
                            equbId,
                            memberId: actor.id,
                            roundNumber: equb.currentRound,
                        },
                    },
                });

                if (existing) {
                    throw new ConflictException(
                        `Duplicate contribution detected. You have already contributed for round ${equb.currentRound}.`
                    );
                }

                // 8. Create Contribution (Append-Only)
                const contribution = await tx.contribution.create({
                    data: {
                        equbId,
                        memberId: actor.id,
                        roundNumber: equb.currentRound,
                        amount: equb.amount,
                        status: ContributionStatus.PENDING,
                    },
                    include: {
                        equb: {
                            select: {
                                id: true,
                                name: true,
                                currentRound: true,
                            },
                        },
                        member: {
                            select: {
                                id: true,
                                email: true,
                                fullName: true,
                            },
                        },
                    },
                });

                // 9. Audit Log: Record creation
                await this.auditService.logEvent(
                    { id: actor.id, role: actor.role },
                    AuditActionType.CONTRIBUTION_CREATED,
                    { type: 'Contribution', id: contribution.id },
                    {
                        equbId,
                        equbName: contribution.equb.name,
                        roundNumber: equb.currentRound,
                        amount: Number(amount),
                        memberId: actor.id,
                        memberName: actor.fullName,
                    },
                );

                return contribution;
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException('Duplicate contribution: You have already contributed for this round.');
            }
            throw error;
        }
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
        };
    }
}
