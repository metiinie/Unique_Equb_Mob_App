import { Injectable, Logger } from '@nestjs/common';
import { AuditEventRepository } from './audit-event.repository';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class AuditEventService {
    private readonly logger = new Logger(AuditEventService.name);

    constructor(private readonly auditEventRepo: AuditEventRepository) { }

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
    }) {
        const take = params.limit || 20;
        const skip = ((params.page || 1) - 1) * take;

        return this.auditEventRepo.findPaginated({
            skip,
            take,
            actionType: params.actionType,
            actorUserId: params.actorUserId,
            entityType: params.entityType,
            entityId: params.entityId,
        });
    }

    /**
     * Read Model: User-specific activities.
     */
    async getMyActivities(userId: string, page = 1, limit = 20) {
        const take = limit;
        const skip = (page - 1) * take;

        return this.auditEventRepo.findPaginated({
            skip,
            take,
            actorUserId: userId,
        });
    }
}
