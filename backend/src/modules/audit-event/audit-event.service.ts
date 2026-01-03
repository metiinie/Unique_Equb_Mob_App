import { Injectable, Logger } from '@nestjs/common';
import { AuditEventRepository } from './audit-event.repository';
import { AuditActionType, GlobalRole } from '@prisma/client';
import { AUDIT_ACTIVITY_MAP } from './audit-mapping';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AdminAuditEventDto, MemberAuditEventDto } from './dto/audit-event-projection.dto';

@Injectable()
export class AuditEventService {
    private readonly logger = new Logger(AuditEventService.name);

    constructor(
        private readonly auditEventRepo: AuditEventRepository,
        private readonly prisma: PrismaService,
    ) { }

    // AuditEvents are append-only. Ordering is deterministic by (timestamp, seqId).

    /**
     * Logs a domain action to the immutable AuditEvent table.
     */
    async logEvent(
        actor: { id: string; role: string },
        action: AuditActionType,
        entity: { type: string; id: string },
        payload: any,
        metadata?: { ipAddress?: string; deviceId?: string; commandId?: string },
    ) {
        try {
            const event = await this.auditEventRepo.create({
                actorUserId: actor.id,
                actorRole: actor.role,
                actionType: action,
                entityType: entity.type,
                entityId: entity.id,
                payload: payload,
                commandId: metadata?.commandId,
                ipAddress: metadata?.ipAddress,
                deviceId: metadata?.deviceId,
            });

            this.logger.log(`Audit Logged: ${action} on ${entity.type}:${entity.id} by ${actor.id}`);
            return event;
        } catch (error) {
            this.logger.error(`CRITICAL: Audit log failed for ${action}!`, error);
            throw error;
        }
    }

    /**
     * Read Model: Admin-only paginated view.
     */
    async getLogs(params: {
        page?: number;
        limit?: number;
        actionType?: AuditActionType;
        actorUserId?: string;
        entityType?: string;
        entityId?: string;
    }, requesterRole: GlobalRole = GlobalRole.ADMIN) {
        const take = params.limit || 20;
        const skip = ((params.page || 1) - 1) * take;

        const result = await this.auditEventRepo.findPaginated({
            skip,
            take,
            actionType: params.actionType,
            actorUserId: params.actorUserId,
            entityType: params.entityType,
            entityId: params.entityId,
        });

        return {
            total: result.total,
            data: result.data
                .map(log => this.projectActivity(log, requesterRole))
                .filter(a => a !== null)
        };
    }

    /**
     * Read Model: User-specific activities (Personal Ledger).
     * Includes events where user is actor, subject, or part of the affected Equb.
     */
    async getMyActivities(userId: string, userRole: GlobalRole, page = 1, limit = 20) {
        const memberships = await this.prisma.membership.findMany({
            where: { userId },
            select: { equbId: true }
        });
        const equbIds = memberships.map(m => m.equbId);

        const take = limit;
        const skip = (page - 1) * take;

        // Invariant: Deterministic ordering by (timestamp ASC, seqId ASC)
        const [data, total] = await this.prisma.$transaction([
            this.prisma.auditEvent.findMany({
                where: {
                    OR: [
                        { actorUserId: userId },
                        { entityType: 'User', entityId: userId },
                        { entityType: 'Equb', entityId: { in: equbIds } }
                    ]
                },
                skip,
                take,
                orderBy: [
                    { timestamp: 'asc' },
                    { seqId: 'asc' }
                ],
            }),
            this.prisma.auditEvent.count({
                where: {
                    OR: [
                        { actorUserId: userId },
                        { entityType: 'User', entityId: userId },
                        { entityType: 'Equb', entityId: { in: equbIds } }
                    ]
                }
            })
        ]);

        return {
            total,
            data: data
                .map(log => this.projectActivity(log, userRole))
                .filter(a => a !== null)
        };
    }

    /**
     * Phase 8: Human-Readable Timeline
     */
    async getEqubTimeline(equbId: string, page = 1, limit = 50) {
        const result = await this.auditEventRepo.findPaginated({
            skip: (page - 1) * limit,
            take: limit,
            entityType: 'Equb',
            entityId: equbId
        });

        return {
            total: result.total,
            timeline: result.data
                .map(log => this.projectActivity(log, GlobalRole.ADMIN))
                .filter(a => a !== null)
        };
    }

    /**
     * PROJECTION LAYER
     * Transforms an immutable AuditEvent into a role-specific DTO.
     * Redaction occurs before serialization.
     */
    private projectActivity(log: any, role: GlobalRole): MemberAuditEventDto | AdminAuditEventDto | null {
        const mapping = AUDIT_ACTIVITY_MAP[log.actionType as AuditActionType];

        if (!mapping) {
            this.logger.error(`INTEGRITY_ALERT: AuditActionType ${log.actionType} missing projection mapping.`);
            return null;
        }

        const projection = mapping[role];
        if (!projection || !projection.isUserVisible) {
            return null;
        }

        if (role === GlobalRole.ADMIN || role === GlobalRole.COLLECTOR) {
            const adminDto = new AdminAuditEventDto();
            adminDto.id = log.id;
            adminDto.timestamp = log.timestamp || log.createdAt;
            adminDto.actionType = log.actionType;
            adminDto.entityType = log.entityType;
            adminDto.entityId = log.entityId;
            adminDto.description = projection.label;
            adminDto.severity = projection.severity;
            adminDto.actorUserId = log.actorUserId;
            adminDto.actorRole = log.actorRole;
            adminDto.payload = log.payload;
            adminDto.ipAddress = log.ipAddress;
            adminDto.deviceId = log.deviceId;
            adminDto.systemVersion = log.systemVersion;
            return adminDto;
        }

        // Hardened redaction for Members
        const memberDto = new MemberAuditEventDto();
        memberDto.id = log.id;
        memberDto.timestamp = log.timestamp || log.createdAt;
        memberDto.description = projection.label;
        memberDto.severity = projection.severity;

        const SAFE_FIELDS = ['equbName', 'roundNumber', 'name', 'amount', 'currency'];
        memberDto.payload = {};
        if (log.payload && typeof log.payload === 'object') {
            Object.keys(log.payload).forEach(key => {
                if (SAFE_FIELDS.includes(key)) {
                    memberDto.payload[key] = log.payload[key];
                }
            });
        }

        return memberDto;
    }
}
