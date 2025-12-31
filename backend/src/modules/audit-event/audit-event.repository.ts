import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class AuditEventRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: {
        actorUserId: string;
        actorRole: string;
        actionType: AuditActionType;
        entityType: string;
        entityId: string;
        payload: any;
        commandId?: string;
        ipAddress?: string;
        deviceId?: string;
    }) {
        return this.prisma.auditEvent.create({
            data: {
                actorUserId: data.actorUserId,
                actorRole: data.actorRole,
                actionType: data.actionType,
                entityType: data.entityType,
                entityId: data.entityId,
                payload: data.payload || {},
                commandId: data.commandId,
                ipAddress: data.ipAddress,
                deviceId: data.deviceId,
            },
        });
    }

    async findPaginated(params: {
        skip?: number;
        take?: number;
        actionType?: AuditActionType;
        actorUserId?: string;
        entityType?: string;
        entityId?: string;
    }) {
        const { skip, take, ...where } = params;
        return this.prisma.auditEvent.findMany({
            where,
            skip: skip || 0,
            take: take || 20,
            orderBy: { timestamp: 'desc' },
        });
    }

    async findByEntity(type: string, id: string) {
        return this.prisma.auditEvent.findMany({
            where: { entityType: type, entityId: id },
            orderBy: { timestamp: 'asc' },
        });
    }
}
