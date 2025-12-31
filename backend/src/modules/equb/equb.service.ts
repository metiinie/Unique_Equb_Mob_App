import { Injectable, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { EqubRepository } from './equb.repository';
import { AuditEventService } from '../audit-event/audit-event.service';
import { CreateEqubDto } from './dtos/create-equb.dto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EqubStatus, MembershipRole, User, GlobalRole, MembershipStatus, PayoutStatus, AuditActionType, ContributionStatus } from '@prisma/client';
import { assertCanActivate, assertCanExecutePayout, assertNotCompleted, assertActive, assertOnHold } from '../../domain/equb-state.rules';

@Injectable()
export class EqubService {
    constructor(
        private readonly equbRepo: EqubRepository, // Still used for reads, but will use 'tx' inside transactions
        private readonly auditService: AuditEventService,
        private readonly prisma: PrismaService,
    ) { }

    /**
     * Defensive Creation: ADMIN only check.
     */
    async createEqub(actor: User, dto: CreateEqubDto) {
        if (actor.role !== GlobalRole.ADMIN) {
            throw new BadRequestException('Security Violation: Only ADMIN can create Equbs');
        }

        return this.prisma.$transaction(async (tx) => {
            const equb = await tx.equb.create({
                data: {
                    name: dto.name,
                    totalRounds: dto.totalRounds,
                    amount: dto.contributionAmount,
                    currency: 'ETB',
                    frequency: 'MONTHLY',
                    roundCycleLength: 30,
                    createdByUserId: actor.id,
                    status: EqubStatus.DRAFT,
                },
            });

            await tx.membership.create({
                data: {
                    equbId: equb.id,
                    userId: actor.id,
                    role: MembershipRole.ADMIN,
                    status: MembershipStatus.ACTIVE,
                },
            });

            await this.auditService.logEvent(
                { id: actor.id, role: actor.role },
                AuditActionType.EQUB_CREATED,
                { type: 'Equb', id: equb.id },
                dto,
            );

            return equb;
        });
    }

    /**
     * Defensive Activation: All invariants checked inside transaction.
     */
    async activateEqub(actor: User, equbId: string) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Fetch current status inside tx
            const equb = await tx.equb.findUnique({ where: { id: equbId } });
            if (!equb) throw new BadRequestException('Equb not found');

            // 2. Role Invariant (Domain Authority)
            if (actor.role !== GlobalRole.ADMIN) {
                throw new BadRequestException('Security Violation: Only ADMIN can activate Equbs');
            }

            // 3. State Invariant (Transition)
            assertCanActivate(equb);

            // 4. Content Invariant: Min 2 members
            const members = await tx.membership.findMany({
                where: { equbId, status: MembershipStatus.ACTIVE }
            });

            if (members.length < 2) {
                throw new BadRequestException('Activation Blocked: Minimum 2 active members required');
            }

            // 5. Execute Transition
            const updated = await tx.equb.update({
                where: { id: equbId },
                data: {
                    status: EqubStatus.ACTIVE,
                    currentRound: 1,
                },
            });

            // 6. Initialize round 1 financials
            await this.initializeRound(tx, equbId, 1, members);

            await this.auditService.logEvent(
                { id: actor.id, role: actor.role },
                AuditActionType.EQUB_ACTIVATED,
                { type: 'Equb', id: equbId },
                { from: EqubStatus.DRAFT, to: EqubStatus.ACTIVE, round: 1 },
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
}
