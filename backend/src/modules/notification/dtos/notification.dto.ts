export enum NotificationType {
    ROUND_COMPLETE = 'ROUND_COMPLETE',
    EQUB_COMPLETED = 'EQUB_COMPLETED',
    CONTRIBUTION_PENDING = 'CONTRIBUTION_PENDING',
    PAYOUT_RECEIVED = 'PAYOUT_RECEIVED',
    AUDIT_ALERT = 'AUDIT_ALERT',
}

export class NotificationDto {
    id: string;
    type: NotificationType;
    sourceId: string; // contributionId / payoutId / roundId
    equbId?: string;
    roundNumber?: number;
    message: string;
    createdAt: Date;
}

export class ContributionNotificationDto {
    memberId: string;
    equbId: string;
    equbName: string;
    roundNumber: number;
    amount: number;
    status: 'PENDING';
}

export class PayoutNotificationDto {
    memberId: string;
    equbId: string;
    equbName: string;
    roundNumber: number;
    amount: number;
    status: 'EXECUTED';
    executedAt: Date;
}

export class AuditNotificationDto {
    alertId: string;
    equbId: string;
    roundNumber?: number;
    type: string;
    message: string;
    createdAt: Date;
}
