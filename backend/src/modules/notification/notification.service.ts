import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
    NotificationDto,
    NotificationType,
    ContributionNotificationDto,
    PayoutNotificationDto,
    AuditNotificationDto
} from './dtos/notification.dto';
import { GlobalRole, MembershipStatus, EqubStatus, ContributionStatus } from '@prisma/client';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Aggregate recent alerts for a user
     */
    async getUserNotifications(userId: string, role: GlobalRole): Promise<NotificationDto[]> {
        const notifications: NotificationDto[] = [];

        // 1. Pending Contributions (for Members)
        if (role === GlobalRole.MEMBER) {
            const pending = await this.getPendingContributions(userId);
            pending.forEach(p => {
                notifications.push({
                    id: `pending-contrib-${p.equbId}-${p.roundNumber}`,
                    type: NotificationType.CONTRIBUTION_PENDING,
                    sourceId: p.equbId,
                    equbId: p.equbId,
                    roundNumber: p.roundNumber,
                    message: `Contribution of ${p.amount} ETB for ${p.equbName} Round ${p.roundNumber} is pending.`,
                    createdAt: new Date(),
                });
            });

            const received = await this.getReceivedPayouts(userId);
            received.slice(0, 5).forEach(r => {
                notifications.push({
                    id: `payout-recv-${r.roundNumber}-${r.equbId}`,
                    type: NotificationType.PAYOUT_RECEIVED,
                    sourceId: r.equbId, // ideally payoutId
                    equbId: r.equbId,
                    roundNumber: r.roundNumber,
                    message: `You received a payout of ${r.amount} ETB for ${r.equbName} Round ${r.roundNumber}.`,
                    createdAt: r.executedAt,
                });
            });
        }

        // 2. Round Completion Alerts (for Admin/Collector)
        if (role === GlobalRole.ADMIN || role === GlobalRole.COLLECTOR) {
            // This could be derived from recent audit events logic if we had a specific "ROUND_ADVANCED" event we want to highlight
            const recentAdvances = await this.prisma.auditEvent.findMany({
                where: { actionType: 'ROUND_PROGRESSED' },
                orderBy: { timestamp: 'desc' },
                take: 10,
            });

            for (const event of recentAdvances) {
                const payload = event.payload as any;
                notifications.push({
                    id: event.id,
                    type: NotificationType.ROUND_COMPLETE,
                    sourceId: event.entityId,
                    equbId: event.entityId,
                    roundNumber: payload?.fromRound,
                    message: `Round ${payload?.fromRound} for Equb successfully completed.`,
                    createdAt: event.timestamp,
                });
            }
        }

        return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    async getPendingContributions(userId: string): Promise<ContributionNotificationDto[]> {
        const memberships = await this.prisma.membership.findMany({
            where: { userId, status: MembershipStatus.ACTIVE },
            include: { equb: true },
        });

        const pending: ContributionNotificationDto[] = [];

        for (const m of memberships) {
            if (m.equb.status !== EqubStatus.ACTIVE) continue;

            // Check if user has contributed for current round
            const contribution = await this.prisma.contribution.findFirst({
                where: {
                    memberId: userId,
                    equbId: m.equb.id,
                    roundNumber: m.equb.currentRound,
                    status: ContributionStatus.CONFIRMED,
                },
            });

            if (!contribution) {
                pending.push({
                    memberId: userId,
                    equbId: m.equb.id,
                    equbName: m.equb.name,
                    roundNumber: m.equb.currentRound,
                    amount: Number(m.equb.amount),
                    status: 'PENDING',
                });
            }
        }

        return pending;
    }

    async getReceivedPayouts(userId: string): Promise<PayoutNotificationDto[]> {
        const payouts = await this.prisma.payout.findMany({
            where: { recipientUserId: userId },
            include: { equb: true },
            orderBy: { executedAt: 'desc' },
        });

        return payouts.map(p => ({
            memberId: userId,
            equbId: p.equbId,
            equbName: p.equb.name,
            roundNumber: p.roundNumber,
            amount: Number(p.amount),
            status: 'EXECUTED',
            executedAt: p.executedAt,
        }));
    }

    async getAuditAlerts(): Promise<AuditNotificationDto[]> {
        // Derived alerts for Admin
        // Scenario 1: Multiple payouts for same round (anomaly)
        // Scenario 2: Equb active but no contributions for more than X days (not implemented here but possible)

        // For now, let's just return nothing or a mock anomaly if detected
        return [];
    }

    async getEqubNotifications(equbId: string, role: GlobalRole): Promise<NotificationDto[]> {
        // Notifications specific to one Equb
        const equb = await this.prisma.equb.findUnique({ where: { id: equbId } });
        if (!equb) return [];

        const notifications: NotificationDto[] = [];

        // Round Progress
        notifications.push({
            id: `equb-status-${equb.id}`,
            type: equb.status === EqubStatus.COMPLETED ? NotificationType.EQUB_COMPLETED : NotificationType.ROUND_COMPLETE,
            sourceId: equb.id,
            message: `Equb is currently in Round ${equb.currentRound} (${equb.status}).`,
            createdAt: new Date(),
        });

        return notifications;
    }
}
