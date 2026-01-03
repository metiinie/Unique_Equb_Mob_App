import { AuditActionType } from '@prisma/client';
import { ActivitySeverity } from '../audit-mapping';

/**
 * AdminAuditEventDto
 * Unrestricted operational fact for internal oversight.
 */
export class AdminAuditEventDto {
    id: string;
    timestamp: Date | string;
    actionType: AuditActionType;
    entityType: string;
    entityId: string;
    description: string;
    severity: ActivitySeverity;
    actorUserId: string;
    actorRole: string;
    payload: any;
    ipAddress?: string;
    deviceId?: string;
    systemVersion: string;
}

/**
 * MemberAuditEventDto
 * Hardened personal receipt. Redacts all PII and internal operational data.
 */
export class MemberAuditEventDto {
    id: string;
    timestamp: Date | string;
    description: string;
    severity: ActivitySeverity;
    payload: {
        equbName?: string;
        roundNumber?: number;
        amount?: number;
        currency?: string;
    };
}
