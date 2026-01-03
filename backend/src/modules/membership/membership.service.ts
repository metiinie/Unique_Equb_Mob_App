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
     * MEMBER INVITATION — PHASE 1 (CONSERVATIVE)
     * 
     * Authorization:
     * - Admin OR Collector only
     * 
     * Domain Preconditions:
     * 1. Equb exists
     * 2. Equb status is ACTIVE
     * 3. No contributions exist for the Equb
     * 4. No payouts exist for the Equb
     * 5. Invited user exists
     * 6. User is not already a member
     * 
     * Transition: Add member to ACTIVE Equb (atomic, no side effects)
     */
    async addMember(actor: User, dto: CreateMembershipDto) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Authorization: Admin OR Collector only
            if (actor.role !== GlobalRole.ADMIN && actor.role !== GlobalRole.COLLECTOR) {
                throw new BadRequestException('Security Violation: Only ADMIN or COLLECTOR can invite members');
            }

            // 2. Precondition: Equb exists
            const equb = await tx.equb.findUnique({
                where: { id: dto.equbId },
            });
            if (!equb) {
                throw new BadRequestException('Equb not found');
            }

            // 3. Precondition: Equb status is DRAFT (Strict Gate: No members added after activation)
            if (equb.status !== EqubStatus.DRAFT) {
                throw new ConflictException(`Cannot add members: Equb status is ${equb.status}. Members can only be added in DRAFT state.`);
            }

            // 4. Precondition: No contributions exist
            const contributionCount = await tx.contribution.count({
                where: { equbId: dto.equbId }
            });
            if (contributionCount > 0) {
                throw new ConflictException('Cannot add members: Contributions have already been recorded for this Equb');
            }

            // 5. Precondition: No payouts exist
            const payoutCount = await tx.payout.count({
                where: { equbId: dto.equbId }
            });
            if (payoutCount > 0) {
                throw new ConflictException('Cannot add members: Payouts have already been executed for this Equb');
            }

            // 6. Precondition: Invited user exists
            const invitedUser = await tx.user.findUnique({
                where: { id: dto.userId }
            });
            if (!invitedUser) {
                throw new BadRequestException('Invited user not found');
            }

            // 7. Precondition: User is not already a member
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

            // 8. Execute Membership Addition (NO SIDE EFFECTS)
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

            // 9. Audit Log
            await this.auditService.logEvent(
                { id: actor.id, role: actor.role },
                AuditActionType.MEMBER_ADDED,
                { type: 'Membership', id: `${dto.equbId}:${dto.userId}` },
                {
                    equbId: dto.equbId,
                    invitedUserId: dto.userId,
                    invitedBy: actor.id,
                },
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

    async removeMember(actor: User, equbId: string, memberUserId: string) {
        return this.prisma.$transaction(async (tx) => {
            if (actor.role !== GlobalRole.ADMIN && actor.role !== GlobalRole.COLLECTOR) {
                throw new BadRequestException('Security Violation: Only ADMIN or COLLECTOR can remove members');
            }

            const equb = await tx.equb.findUnique({ where: { id: equbId } });
            if (!equb) throw new BadRequestException('Equb not found');

            // Critical: In ACTIVE state, use suspendMember instead of delete to keep audit continuity
            if (equb.status !== EqubStatus.DRAFT) {
                throw new ConflictException('Cannot delete membership from active Equb. Use suspendMember instead.');
            }

            const membership = await tx.membership.delete({
                where: { equbId_userId: { equbId, userId: memberUserId } }
            });

            await this.auditService.logEvent(
                { id: actor.id, role: actor.role },
                AuditActionType.MEMBER_REMOVED,
                { type: 'Membership', id: `${equbId}:${memberUserId}` },
                { equbId, removedUserId: memberUserId }
            );

            return membership;
        });
    }

    async suspendMember(actor: User, equbId: string, memberUserId: string) {
        return this.prisma.$transaction(async (tx) => {
            if (actor.role !== GlobalRole.ADMIN && actor.role !== GlobalRole.COLLECTOR) {
                throw new BadRequestException('Security Violation: Unauthorized');
            }

            const membership = await tx.membership.update({
                where: { equbId_userId: { equbId, userId: memberUserId } },
                data: { status: MembershipStatus.SUSPENDED }
            });

            await this.auditService.logEvent(
                { id: actor.id, role: actor.role },
                AuditActionType.MEMBER_REMOVED,
                { type: 'Membership', id: `${equbId}:${memberUserId}` },
                { equbId, memberUserId, action: 'SUSPENDED' }
            );

            return membership;
        });
    }

    async reinstateMember(actor: User, equbId: string, memberUserId: string) {
        return this.prisma.$transaction(async (tx) => {
            if (actor.role !== GlobalRole.ADMIN && actor.role !== GlobalRole.COLLECTOR) {
                throw new BadRequestException('Security Violation: Unauthorized');
            }

            const membership = await tx.membership.update({
                where: { equbId_userId: { equbId, userId: memberUserId } },
                data: { status: MembershipStatus.ACTIVE }
            });

            await this.auditService.logEvent(
                { id: actor.id, role: actor.role },
                AuditActionType.MEMBER_ADDED,
                { type: 'Membership', id: `${equbId}:${memberUserId}` },
                { equbId, memberUserId, action: 'REINSTATED' }
            );

            return membership;
        });
    }

    async changeMemberRole(actor: User, equbId: string, memberUserId: string, newRole: MembershipRole) {
        return this.prisma.$transaction(async (tx) => {
            if (actor.role !== GlobalRole.ADMIN) {
                throw new BadRequestException('Security Violation: Only ADMIN can change membership roles');
            }

            const membership = await tx.membership.update({
                where: { equbId_userId: { equbId, userId: memberUserId } },
                data: { role: newRole }
            });

            await this.auditService.logEvent(
                { id: actor.id, role: actor.role },
                AuditActionType.MEMBER_ADDED, // Using ADDED as proxy or mapping more granularly
                { type: 'Membership', id: `${equbId}:${memberUserId}` },
                { equbId, memberUserId, newRole }
            );

            return membership;
        });
    }
}
