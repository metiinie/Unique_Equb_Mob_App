import { Injectable, BadRequestException, ConflictException, ForbiddenException, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { EqubRepository } from './equb.repository';
import { AuditEventService } from '../audit-event/audit-event.service';
import { CreateEqubDto } from './dtos/create-equb.dto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EqubStatus, MembershipRole, User, GlobalRole, MembershipStatus, PayoutStatus, AuditActionType, ContributionStatus } from '@prisma/client';
import { assertCanActivate, assertCanExecutePayout, assertNotCompleted, assertActive, assertOnHold } from '../../domain/equb-state.rules';

@Injectable()
export class EqubService {
    private readonly logger = new Logger(EqubService.name);

    constructor(
        private readonly equbRepo: EqubRepository, // Still used for reads, but will use 'tx' inside transactions
        private readonly auditService: AuditEventService,
        private readonly prisma: PrismaService,
    ) { }

    /**
     * Defensive Creation: ADMIN only check.
     * Domain Rules Enforced:
     * - Admin-only authorization
     * - Future startDate validation (validated but not persisted due to schema constraints)
     * - Equb starts in DRAFT state
     * - currentRound starts at 1
     */
    async createEqub(actor: User, dto: CreateEqubDto) {
        if (actor.role !== GlobalRole.ADMIN) {
            throw new BadRequestException('Security Violation: Only ADMIN can create Equbs');
        }

        // Domain Rule: startDate must be in the future (validated here)
        const startDate = new Date(dto.startDate);
        const now = new Date();
        if (startDate <= now) {
            throw new BadRequestException('Start date must be in the future');
        }

        return this.prisma.$transaction(async (tx) => {
            // IDEMPOTENCY CHECK: Avoid duplicate creation from retries
            if (dto.idempotencyKey) {
                const existing = await tx.equb.findUnique({
                    where: { idempotencyKey: dto.idempotencyKey }
                });
                if (existing) {
                    this.logger.log(`Idempotent Hit: Equb ${existing.id} already exists for key ${dto.idempotencyKey}`);
                    return existing;
                }
            }

            const equb = await tx.equb.create({
                data: {
                    name: dto.name,
                    idempotencyKey: dto.idempotencyKey,
                    totalRounds: dto.totalRounds,
                    amount: dto.contributionAmount,
                    currency: 'ETB',
                    frequency: 'MONTHLY',
                    roundCycleLength: dto.cycleLength,
                    createdByUserId: actor.id,
                    status: EqubStatus.DRAFT,
                    currentRound: 1, // Starts at 1 as per domain rules
                },
            });

            // Auto-add creator as ADMIN member
            await tx.membership.create({
                data: {
                    equbId: equb.id,
                    userId: actor.id,
                    role: MembershipRole.ADMIN,
                    status: MembershipStatus.ACTIVE,
                },
            });

            // Audit log with full DTO including startDate and payoutOrderType
            await this.auditService.logEvent(
                { id: actor.id, role: actor.role },
                AuditActionType.EQUB_CREATED,
                { type: 'Equb', id: equb.id },
                { ...dto, startDate: startDate.toISOString() },
            );

            return equb;
        });
    }

    /**
     * EQUB ACTIVATION — PURE STATE TRANSITION
     * 
     * Domain Invariants Enforced:
     * 1. Admin-only authorization
     * 2. Status must be DRAFT
     * 3. contributionAmount > 0
     * 4. cycleLength >= 2
     * 5. startDate is today or in the future
     * 6. currentRound === 1
     * 7. No payouts executed
     * 8. No contributions recorded
     * 
     * Transition: DRAFT → ACTIVE (atomic, no side effects)
     */
    async activateEqub(actor: User, equbId: string) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Fetch Equb inside transaction
            const equb = await tx.equb.findUnique({ where: { id: equbId } });
            if (!equb) {
                throw new BadRequestException('Equb not found');
            }

            // 2. Authorization Invariant: Admin-only
            if (actor.role !== GlobalRole.ADMIN) {
                throw new BadRequestException('Security Violation: Only ADMIN can activate Equbs');
            }

            // 3. State Transition Invariant: Must be DRAFT
            assertCanActivate(equb);

            // 4. Domain Invariant: contributionAmount > 0
            if (Number(equb.amount) <= 0) {
                throw new BadRequestException('Activation Blocked: Contribution amount must be greater than 0');
            }

            // 5. Domain Invariant: cycleLength >= 2
            if (equb.roundCycleLength < 2) {
                throw new BadRequestException('Activation Blocked: Cycle length must be at least 2 days');
            }

            // 6. Domain Invariant: startDate is today or in the future
            // Note: startDate not in schema, so we skip this check
            // If startDate exists in future schema, uncomment:
            // const now = new Date();
            // const startDate = new Date(equb.startDate);
            // if (startDate < now) {
            //     throw new BadRequestException('Activation Blocked: Start date must be today or in the future');
            // }

            // 7. Domain Invariant: currentRound === 1
            if (equb.currentRound !== 1) {
                throw new BadRequestException(`Activation Blocked: currentRound must be 1, found ${equb.currentRound}`);
            }

            // 8. Domain Invariant: No payouts executed
            const payoutCount = await tx.payout.count({
                where: { equbId }
            });
            if (payoutCount > 0) {
                throw new BadRequestException('Activation Blocked: Equb has existing payouts');
            }

            // 9. Domain Invariant: No contributions recorded
            const contributionCount = await tx.contribution.count({
                where: { equbId }
            });
            if (contributionCount > 0) {
                throw new BadRequestException('Activation Blocked: Equb has existing contributions');
            }

            // 10. Domain Invariant: Member count must match total rounds (Full Capacity)
            const memberCount = await tx.membership.count({
                where: { equbId, status: MembershipStatus.ACTIVE, role: MembershipRole.MEMBER }
            });
            if (memberCount !== equb.totalRounds) {
                throw new BadRequestException(`Activation Blocked: Member count (${memberCount}) must match total rounds (${equb.totalRounds}). All slots must be filled.`);
            }

            // 10. Execute Pure State Transition (NO SIDE EFFECTS)
            const updated = await tx.equb.update({
                where: { id: equbId },
                data: {
                    status: EqubStatus.ACTIVE,
                    // currentRound remains 1 (no change)
                },
            });

            // 11. Audit Log
            await this.auditService.logEvent(
                { id: actor.id, role: actor.role },
                AuditActionType.EQUB_ACTIVATED,
                { type: 'Equb', id: equbId },
                {
                    previousStatus: EqubStatus.DRAFT,
                    newStatus: EqubStatus.ACTIVE,
                    activatedBy: actor.id,
                },
            );

            return updated;
        });
    }

    /**
     * ROUND ADVANCEMENT — PHASE 2 (DERIVED STATE OPERATION)
     * 
     * Domain Invariants Enforced:
     * 1. Authorization: Admin OR Collector only
     * 2. Equb exists
     * 3. Equb status is ACTIVE
     * 4. Current round has all contributions CONFIRMED
     * 5. Current round has payout EXECUTED
     * 
     * Transition: Increment currentRound (atomic, no side effects on financial data)
     */
    async advanceRound(actor: User, equbId: string) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Authorization Invariant: Admin OR Collector only
            if (actor.role !== GlobalRole.ADMIN && actor.role !== GlobalRole.COLLECTOR) {
                throw new BadRequestException('Security Violation: Only ADMIN or COLLECTOR can advance rounds');
            }

            // 2. Precondition: Equb exists
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
                throw new BadRequestException('Equb not found');
            }

            // 3. Precondition: Equb status is ACTIVE
            if (equb.status !== EqubStatus.ACTIVE) {
                throw new ConflictException(`Cannot advance round: Equb status is ${equb.status}. Only ACTIVE Equbs can advance rounds.`);
            }

            // 4. Precondition: Current round has all contributions CONFIRMED
            const memberCount = equb.memberships.length;
            if (memberCount === 0) {
                throw new BadRequestException('No active MEMBER memberships found');
            }

            const confirmedContributions = await tx.contribution.count({
                where: {
                    equbId,
                    roundNumber: equb.currentRound,
                    status: ContributionStatus.CONFIRMED,
                },
            });

            if (confirmedContributions !== memberCount) {
                throw new ConflictException(`Cannot advance round: Only ${confirmedContributions} of ${memberCount} members have confirmed contributions for round ${equb.currentRound}`);
            }

            // 5. Precondition: Current round has payout EXECUTED
            const payout = await tx.payout.findUnique({
                where: {
                    equbId_roundNumber: {
                        equbId,
                        roundNumber: equb.currentRound,
                    },
                },
            });

            if (!payout || payout.status !== PayoutStatus.EXECUTED) {
                throw new ConflictException(`Cannot advance round: Payout not executed for round ${equb.currentRound}`);
            }

            // 6. Execute Derived State Update (NO SIDE EFFECTS)
            const previousRound = equb.currentRound;
            const nextRound = previousRound + 1;

            const updated = await tx.equb.update({
                where: { id: equbId },
                data: {
                    currentRound: nextRound,
                },
            });

            // 7. Audit Log
            await this.auditService.logEvent(
                { id: actor.id, role: actor.role },
                AuditActionType.ROUND_PROGRESSED,
                { type: 'Equb', id: equbId },
                {
                    previousRound,
                    currentRound: nextRound,
                    advancedBy: actor.id,
                },
            );

            return updated;
        });
    }

    /**
     * EQUB COMPLETION — PHASE 2 (DERIVED STATE OPERATION)
     * 
     * Domain Invariants Enforced:
     * 1. Authorization: Admin OR Collector only
     * 2. Equb exists
     * 3. Equb status is ACTIVE
     * 4. currentRound === totalRounds
     * 5. Last round has payout EXECUTED
     * 
     * Transition: Update status to COMPLETED (atomic, no side effects on financial data)
     */
    async completeEqub(actor: User, equbId: string) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Authorization Invariant: Admin OR Collector only
            if (actor.role !== GlobalRole.ADMIN && actor.role !== GlobalRole.COLLECTOR) {
                throw new BadRequestException('Security Violation: Only ADMIN or COLLECTOR can complete Equbs');
            }

            // 2. Precondition: Equb exists
            const equb = await tx.equb.findUnique({
                where: { id: equbId },
            });

            if (!equb) {
                throw new BadRequestException('Equb not found');
            }

            // 3. Precondition: Equb status is ACTIVE
            if (equb.status !== EqubStatus.ACTIVE) {
                throw new ConflictException(`Cannot complete Equb: Status is ${equb.status}. Only ACTIVE Equbs can be completed.`);
            }

            // 4. Precondition: currentRound === totalRounds
            if (equb.currentRound !== equb.totalRounds) {
                throw new ConflictException(`Cannot complete Equb: Current round is ${equb.currentRound}, but total rounds is ${equb.totalRounds}. All rounds must be completed.`);
            }

            // 5. Precondition: Last round has payout EXECUTED
            const lastRoundPayout = await tx.payout.findUnique({
                where: {
                    equbId_roundNumber: {
                        equbId,
                        roundNumber: equb.totalRounds,
                    },
                },
            });

            if (!lastRoundPayout || lastRoundPayout.status !== PayoutStatus.EXECUTED) {
                throw new ConflictException(`Cannot complete Equb: Payout not executed for final round ${equb.totalRounds}`);
            }

            // 6. Execute Derived State Update (NO SIDE EFFECTS)
            const updated = await tx.equb.update({
                where: { id: equbId },
                data: {
                    status: EqubStatus.COMPLETED,
                },
            });

            // 7. Audit Log
            await this.auditService.logEvent(
                { id: actor.id, role: actor.role },
                AuditActionType.EQUB_COMPLETED,
                { type: 'Equb', id: equbId },
                {
                    previousStatus: EqubStatus.ACTIVE,
                    newStatus: EqubStatus.COMPLETED,
                    completedAt: new Date().toISOString(),
                    completedBy: actor.id,
                    finalRound: equb.totalRounds,
                },
            );

            return updated;
        });
    }

    /**
     * Internal method ALWAYS called inside a transaction.
     */
    private async initializeRound(tx: any, equbId: string, roundNumber: number, members: any[]) {
        const equb = await tx.equb.findUnique({ where: { id: equbId } });

        for (const member of members) {
            // Only create contributions for members with role MEMBER
            if (member.role !== MembershipRole.MEMBER) continue;

            await tx.contribution.create({
                data: {
                    equbId,
                    memberId: member.userId,
                    roundNumber,
                    amount: equb.amount,
                    status: ContributionStatus.PENDING,
                }
            });
        }

        const previousWinners = await tx.payout.findMany({
            where: { equbId, status: { in: [PayoutStatus.EXECUTED, PayoutStatus.COMPLETED, PayoutStatus.SCHEDULED] } },
            select: { recipientUserId: true }
        });
        const winnerIds = previousWinners.map(w => w.recipientUserId);

        const eligibleMember = members.find(m => m.role === MembershipRole.MEMBER && !winnerIds.includes(m.userId));

        if (eligibleMember) {
            await tx.payout.create({
                data: {
                    equbId,
                    recipientUserId: eligibleMember.userId,
                    roundNumber,
                    amount: Number(equb.amount) * members.filter(m => m.role === MembershipRole.MEMBER).length,
                    status: PayoutStatus.PENDING,
                }
            });
        }
    }

    /**
     * Defensive Round Progression.
     */
    async progressRound(actor: User, equbId: string) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Fetch current status inside tx
            const equb = await tx.equb.findUnique({ where: { id: equbId } });
            if (!equb) throw new BadRequestException('Equb not found');

            // 2. Role Invariant
            if (actor.role !== GlobalRole.ADMIN) {
                throw new BadRequestException('Security Violation: Only ADMIN can progress rounds');
            }

            // 3. State Invariant
            assertCanExecutePayout(equb);

            // 4. Financial Invariant: Payout of current round must be EXECUTED
            const currentPayout = await tx.payout.findUnique({
                where: { equbId_roundNumber: { equbId, roundNumber: equb.currentRound } }
            });

            if (!currentPayout || currentPayout.status !== PayoutStatus.EXECUTED) {
                throw new ConflictException('Progression Blocked: Current round payout is not EXECUTED');
            }

            // 5. Terminal State Check
            if (equb.currentRound >= equb.totalRounds) {
                return this.completeEqubInternal(tx, actor, equbId);
            }

            // 6. Execute Progression
            const nextRound = equb.currentRound + 1;
            const updated = await tx.equb.update({
                where: { id: equbId },
                data: { currentRound: nextRound }
            });

            const members = await tx.membership.findMany({
                where: { equbId, status: MembershipStatus.ACTIVE }
            });

            await this.initializeRound(tx, equbId, nextRound, members);

            await this.auditService.logEvent(
                { id: actor.id, role: actor.role },
                AuditActionType.ROUND_PROGRESSED,
                { type: 'Equb', id: equbId },
                { fromRound: equb.currentRound, toRound: nextRound },
            );

            return updated;
        });
    }

    private async completeEqubInternal(tx: any, actor: User, equbId: string) {
        const updated = await tx.equb.update({
            where: { id: equbId },
            data: { status: EqubStatus.COMPLETED }
        });

        await this.auditService.logEvent(
            { id: actor.id, role: actor.role },
            AuditActionType.EQUB_COMPLETED,
            { type: 'Equb', id: equbId },
            {}
        );

        return updated;
    }

    async holdEqub(actor: User, equbId: string, reason: string) {
        return this.prisma.$transaction(async (tx) => {
            const equb = await tx.equb.findUnique({ where: { id: equbId } });
            if (!equb) throw new BadRequestException('Equb not found');

            if (actor.role !== GlobalRole.ADMIN) throw new BadRequestException('Only ADMIN can put Equb on hold');
            assertNotCompleted(equb);
            assertActive(equb);

            const updated = await tx.equb.update({ where: { id: equbId }, data: { status: EqubStatus.ON_HOLD } });
            await this.auditService.logEvent({ id: actor.id, role: actor.role }, AuditActionType.EQUB_ON_HOLD, { type: 'Equb', id: equbId }, { reason });
            return updated;
        });
    }

    async resumeEqub(actor: User, equbId: string) {
        return this.prisma.$transaction(async (tx) => {
            const equb = await tx.equb.findUnique({ where: { id: equbId } });
            if (!equb) throw new BadRequestException('Equb not found');

            if (actor.role !== GlobalRole.ADMIN) throw new BadRequestException('Only ADMIN can resume Equb');
            assertNotCompleted(equb);
            assertOnHold(equb);

            const updated = await tx.equb.update({ where: { id: equbId }, data: { status: EqubStatus.ACTIVE } });
            await this.auditService.logEvent({ id: actor.id, role: actor.role }, AuditActionType.EQUB_RESUMED, { type: 'Equb', id: equbId }, { from: EqubStatus.ON_HOLD, to: EqubStatus.ACTIVE });
            return updated;
        });
    }

    async terminateEqub(actor: User, equbId: string, reason: string) {
        return this.prisma.$transaction(async (tx) => {
            const equb = await tx.equb.findUnique({ where: { id: equbId } });
            if (!equb) throw new BadRequestException('Equb not found');

            if (actor.role !== GlobalRole.ADMIN) throw new BadRequestException('Only ADMIN can terminate Equb');
            assertNotCompleted(equb);

            const updated = await tx.equb.update({ where: { id: equbId }, data: { status: EqubStatus.TERMINATED } });
            await this.auditService.logEvent({ id: actor.id, role: actor.role }, AuditActionType.EQUB_TERMINATED, { type: 'Equb', id: equbId }, { reason });
            return updated;
        });
    }

    async getEqubById(equbId: string) {
        const equb = await this.prisma.equb.findUnique({
            where: { id: equbId },
            include: {
                _count: {
                    select: { memberships: true }
                }
            }
        });
        if (!equb) throw new BadRequestException('Equb not found');
        return equb;
    }

    async getManagedEqubs(user: User) {
        // Domain Truth: Managed means user is ADMIN or COLLECTOR in the membership
        // This is the source of truth for "management" access.
        return this.prisma.equb.findMany({
            where: {
                memberships: {
                    some: {
                        userId: user.id,
                        role: { in: [MembershipRole.ADMIN, MembershipRole.COLLECTOR] },
                        status: MembershipStatus.ACTIVE
                    }
                }
            },
            include: {
                memberships: {
                    where: { userId: user.id },
                    select: { role: true }
                },
                _count: {
                    select: { memberships: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
    }

    async getManagedSummary(user: User) {
        // Find all equbs where user is ADMIN or COLLECTOR
        const managedEqubs = await this.prisma.equb.findMany({
            where: {
                memberships: {
                    some: {
                        userId: user.id,
                        role: { in: [MembershipRole.ADMIN, MembershipRole.COLLECTOR] },
                        status: MembershipStatus.ACTIVE
                    }
                }
            },
            select: { id: true }
        });

        const equbIds = managedEqubs.map(e => e.id);

        if (equbIds.length === 0) {
            return {
                totalVolume: 0,
                totalMembers: 0,
                managedCount: 0,
                todayCollected: 0,
                todayPending: 0
            };
        }

        // Total Volume: Sum of all EXECUTED payouts in these equbs
        const payoutSum = await this.prisma.payout.aggregate({
            where: {
                equbId: { in: equbIds },
                status: PayoutStatus.EXECUTED
            },
            _sum: { amount: true }
        });

        // Total Members: Distinct users with MEMBER role in these equbs
        const memberCount = await this.prisma.membership.count({
            where: {
                equbId: { in: equbIds },
                role: MembershipRole.MEMBER,
                status: MembershipStatus.ACTIVE
            }
        });

        // Today's Stats (for Collectors primarily)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayCollected = await this.prisma.contribution.aggregate({
            where: {
                equbId: { in: equbIds },
                createdAt: { gte: today },
                status: ContributionStatus.CONFIRMED
            },
            _sum: { amount: true }
        });

        const todayPending = await this.prisma.contribution.aggregate({
            where: {
                equbId: { in: equbIds },
                createdAt: { gte: today },
                status: ContributionStatus.PENDING
            },
            _sum: { amount: true }
        });

        return {
            totalVolume: Number(payoutSum._sum.amount || 0),
            totalMembers: memberCount,
            managedCount: equbIds.length,
            todayCollected: Number(todayCollected._sum.amount || 0),
            todayPending: Number(todayPending._sum.amount || 0)
        };
    }

    async listEqubs(user: User) {
        if (user.role === GlobalRole.ADMIN) {
            const equbs = await this.prisma.equb.findMany({
                include: {
                    memberships: {
                        where: { userId: user.id },
                        select: { role: true }
                    },
                    _count: {
                        select: { memberships: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            return equbs.map(e => ({
                ...e,
                myRole: e.memberships[0]?.role || 'ADMIN' // System Admin has at least read-only power, but if they are a member, they have that role
            }));
        }

        // For non-admins, return equbs where they have a membership
        const equbs = await this.prisma.equb.findMany({
            where: {
                memberships: {
                    some: {
                        userId: user.id
                    }
                }
            },
            include: {
                memberships: {
                    where: { userId: user.id },
                    select: { role: true }
                },
                _count: {
                    select: { memberships: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return equbs.map(e => ({
            ...e,
            myRole: e.memberships[0]?.role || 'MEMBER'
        }));
    }

    async getAuditTrail(equbId: string) {
        return this.prisma.auditEvent.findMany({
            where: {
                entityType: 'Equb',
                entityId: equbId,
            },
            orderBy: { timestamp: 'desc' },
        });
    }

    async getEqubSummary(actor: User, equbId: string) {
        const equb = await this.prisma.equb.findUnique({
            where: { id: equbId },
            include: {
                memberships: {
                    where: { status: MembershipStatus.ACTIVE },
                    include: { user: { select: { id: true, fullName: true, email: true, role: true } } }
                }
            }
        });

        if (!equb) throw new NotFoundException('Equb not found');

        const contributionCount = await this.prisma.contribution.count({
            where: { equbId, roundNumber: equb.currentRound, status: ContributionStatus.CONFIRMED }
        });

        const payout = await this.prisma.payout.findUnique({
            where: { equbId_roundNumber: { equbId, roundNumber: equb.currentRound } },
            include: { recipient: { select: { fullName: true } } }
        });

        return {
            ...equb,
            stats: {
                totalMembers: equb.memberships.filter(m => m.role === MembershipRole.MEMBER).length,
                confirmedContributions: contributionCount,
                payoutExecuted: !!payout && payout.status === PayoutStatus.EXECUTED,
                recipientName: payout?.recipient?.fullName || null,
            }
        };
    }

    async getCurrentRoundInfo(equbId: string) {
        const equb = await this.prisma.equb.findUnique({
            where: { id: equbId },
            select: { currentRound: true, totalRounds: true, amount: true }
        });

        if (!equb) throw new NotFoundException('Equb not found');

        const contributions = await this.prisma.contribution.findMany({
            where: { equbId, roundNumber: equb.currentRound },
            include: { member: { select: { fullName: true, id: true } } }
        });

        const payout = await this.prisma.payout.findUnique({
            where: { equbId_roundNumber: { equbId, roundNumber: equb.currentRound } },
            include: { recipient: { select: { fullName: true, id: true } } }
        });

        return {
            roundNumber: equb.currentRound,
            totalRounds: equb.totalRounds,
            amount: equb.amount,
            contributions,
            payout,
        };
    }
    /**
     * Phase 5: Get comprehensive financial ledger for a specific round
     */
    async getRoundLedger(equbId: string, roundNumber: number) {
        const [contributions, payout] = await Promise.all([
            this.prisma.contribution.findMany({
                where: { equbId, roundNumber },
                include: { member: { select: { id: true, fullName: true } } }
            }),
            this.prisma.payout.findUnique({
                where: { equbId_roundNumber: { equbId, roundNumber } },
                include: { recipient: { select: { id: true, fullName: true } } }
            })
        ]);

        const totalContributed = contributions
            .filter(c => c.status === ContributionStatus.SETTLED || c.status === ContributionStatus.CONFIRMED)
            .reduce((sum, c) => sum + Number(c.amount), 0);

        const reconciled = payout ? (totalContributed === Number(payout.amount)) : false;

        return {
            roundNumber,
            contributions: contributions.map(c => ({
                id: c.id,
                memberId: c.memberId,
                memberName: c.member.fullName,
                amount: Number(c.amount),
                status: c.status,
                timestamp: c.updatedAt
            })),
            payout: payout ? {
                id: payout.id,
                amount: Number(payout.amount),
                recipientId: payout.recipientUserId,
                recipientName: payout.recipient.fullName,
                executedAt: payout.executedAt,
                status: payout.status
            } : null,
            reconciliation: {
                totalContributed,
                expectedAmount: payout ? Number(payout.amount) : 0,
                isReconciled: reconciled,
                checksum: `SIG_${equbId}_${roundNumber}_${totalContributed}`
            }
        };
    }

    /**
     * Phase 5: Get high-level financial summary for an Equb
     */
    async getFinancialSummary(equbId: string) {
        const equb = await this.prisma.equb.findUnique({
            where: { id: equbId },
            include: {
                _count: {
                    select: {
                        memberships: { where: { role: MembershipRole.MEMBER, status: MembershipStatus.ACTIVE } },
                        payouts: true
                    }
                }
            }
        });

        if (!equb) throw new NotFoundException('Equb not found');

        const settledStats = await this.prisma.contribution.aggregate({
            where: { equbId, status: ContributionStatus.SETTLED },
            _sum: { amount: true },
            _count: { id: true }
        });

        const totalPaidOut = await this.prisma.payout.aggregate({
            where: { equbId, status: PayoutStatus.EXECUTED },
            _sum: { amount: true }
        });

        const activeMemberCount = equb._count.memberships;

        return {
            equbId,
            equbName: equb.name,
            totalVolume: Number(totalPaidOut._sum.amount || 0),
            totalSettled: Number(settledStats._sum.amount || 0),
            contributionCount: settledStats._count.id,
            completedRounds: equb._count.payouts,
            remainingRounds: Math.max(0, equb.totalRounds - equb._count.payouts),
            activeMemberCount,
            contributionAmount: Number(equb.amount),
            currency: equb.currency,
            status: equb.status
        };
    }

    /**
     * Phase 5: Get derived status flags for UX contracts
     */
    async getStatusFlags(equbId: string) {
        const equb = await this.prisma.equb.findUnique({
            where: { id: equbId },
            include: {
                memberships: { where: { role: MembershipRole.MEMBER, status: MembershipStatus.ACTIVE } }
            }
        });

        if (!equb) throw new NotFoundException('Equb not found');

        const currentRound = equb.currentRound;
        const memberCount = equb.memberships.length;

        const confirmedCount = await this.prisma.contribution.count({
            where: { equbId, roundNumber: currentRound, status: ContributionStatus.CONFIRMED }
        });

        const settledCount = await this.prisma.contribution.count({
            where: { equbId, roundNumber: currentRound, status: ContributionStatus.SETTLED }
        });

        const payoutExists = await this.prisma.payout.count({
            where: { equbId, roundNumber: currentRound }
        }) > 0;

        const isFullyFunded = confirmedCount === memberCount;
        const isRoundOpen = equb.status === EqubStatus.ACTIVE && !payoutExists;
        const canExecutePayout = isFullyFunded && !payoutExists && equb.status === EqubStatus.ACTIVE;
        const isEqubCompleted = equb.status === EqubStatus.COMPLETED;

        return {
            isRoundOpen,
            isFullyFunded,
            canExecutePayout,
            isEqubCompleted,
            currentRound,
            totalRounds: equb.totalRounds,
            confirmedCount,
            settledCount,
            memberCount
        };
    }

    /**
     * Phase 5: Get comprehensive FULL ledger for all rounds
     */
    async getFullLedger(equbId: string) {
        const equb = await this.prisma.equb.findUnique({
            where: { id: equbId },
            include: {
                _count: { select: { memberships: { where: { role: MembershipRole.MEMBER, status: MembershipStatus.ACTIVE } } } }
            }
        });

        if (!equb) throw new NotFoundException('Equb not found');

        // Fetch all payouts to map to rounds
        const payouts = await this.prisma.payout.findMany({
            where: { equbId },
            include: { recipient: { select: { fullName: true } } },
            orderBy: { roundNumber: 'asc' }
        });

        // Fetch contribution counts per round
        const contributions = await this.prisma.contribution.groupBy({
            by: ['roundNumber'],
            where: {
                equbId,
                status: { in: [ContributionStatus.CONFIRMED, ContributionStatus.SETTLED] }
            },
            _count: { id: true },
            _sum: { amount: true }
        });

        const ledger = [];
        // Show all rounds up to Total Rounds? Or just active?
        // Prompt says "Round Ledger (Chronological, immutable)". Best to show all rounds up to current one + completed ones.
        // Actually, let's show all generated rounds up to current.

        for (let i = 1; i <= equb.currentRound; i++) {
            const payout = payouts.find(p => p.roundNumber === i);
            const contrib = contributions.find(c => c.roundNumber === i);

            // Calculate expected amount based on current active members (simplification: assumes constant membership)
            const expectedAmount = Number(equb.amount) * equb._count.memberships;

            ledger.push({
                roundNumber: i,
                expectedAmount,
                collectedAmount: Number(contrib?._sum?.amount || 0),
                contributionCount: Number(contrib?._count?.id || 0),
                payoutRecipient: payout?.recipient?.fullName || null,
                status: payout ? payout.status : 'OPEN',
                isCurrent: i === equb.currentRound
            });
        }

        return ledger;
    }
}
