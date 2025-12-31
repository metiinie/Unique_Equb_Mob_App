import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { MembershipRepository } from './membership.repository';
import { AuditEventService } from '../audit-event/audit-event.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MembershipRole, MembershipStatus, EqubStatus, User, AuditActionType, GlobalRole } from '@prisma/client';
import { assertNotCompleted } from '../../domain/equb-state.rules';
import { CreateMembershipDto } from './dtos/create-membership.dto';

@Injectable()
export class MembershipService {
    constructor(
        private readonly membershipRepo: MembershipRepository,
        private readonly auditService: AuditEventService,
        private readonly prisma: PrismaService,
    ) { }

    /**
     * Defensive Implementation: All checks moved inside transaction.
     */
    async addMember(actor: User, dto: CreateMembershipDto) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Re-fetch Equb inside transaction (Atomic check)
            const equb = await tx.equb.findUnique({
                where: { id: dto.equbId },
            });
            if (!equb) throw new BadRequestException('Equb not found');

            // 2. State Invariant: No new members unless DRAFT (Admin override permitted)
            assertNotCompleted(equb);
            if (equb.status !== EqubStatus.DRAFT && actor.role !== GlobalRole.ADMIN) {
                throw new ConflictException(`Cannot add members to an Equb in ${equb.status} state`);
            }

            // 3. Duplicate/Status Invariant: No duplicate active memberships
            const existing = await tx.membership.findUnique({
                where: {
                    equbId_userId: {
                        equbId: dto.equbId,
                        userId: dto.userId,
                    },
                },
            });

            if (existing && existing.status === MembershipStatus.ACTIVE) {
                throw new ConflictException('User is already an active member of this Equb');
            }

            // 4. Role Guard: Assign role based on actor or input (simplifying for now)
            const roleToAssign = MembershipRole.MEMBER;

            const membership = await tx.membership.upsert({
                where: {
                    equbId_userId: {
                        equbId: dto.equbId,
                        userId: dto.userId,
                    },
                },
                update: {
                    status: MembershipStatus.ACTIVE,
                    role: MembershipRole.MEMBER,
                },
                create: {
                    equbId: dto.equbId,
                    userId: dto.userId,
                    role: MembershipRole.MEMBER,
                    status: MembershipStatus.ACTIVE,
                },
            });

            // 5. Atomic Audit
            await this.auditService.logEvent(
                { id: actor.id, role: actor.role },
                AuditActionType.MEMBER_ADDED,
                { type: 'Membership', id: `${dto.equbId}:${dto.userId}` },
                dto,
            );

            return membership;
        });
    }

    async getMembersByEqub(equbId: string) {
        return this.prisma.membership.findMany({
            where: { equbId, status: MembershipStatus.ACTIVE },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true,
                    }
                }
            }
        });
    }
}
