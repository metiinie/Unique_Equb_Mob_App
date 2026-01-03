import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EqubStatus, PayoutStatus, ContributionStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Aggregated Equb KPIs
     */
    async getEqubAnalyticsSummary() {
        const [totalEqubs, activeEqubs, completedEqubs, totalMemberships] = await Promise.all([
            this.prisma.equb.count(),
            this.prisma.equb.count({ where: { status: EqubStatus.ACTIVE } }),
            this.prisma.equb.count({ where: { status: EqubStatus.COMPLETED } }),
            this.prisma.membership.count(),
        ]);

        const statusDistribution = await this.prisma.equb.groupBy({
            by: ['status'],
            _count: { id: true },
        });

        return {
            overview: {
                totalEqubs,
                activeEqubs,
                completedEqubs,
                totalMemberships,
                completionRate: totalEqubs > 0 ? (completedEqubs / totalEqubs) * 100 : 0,
            },
            statusDistribution: statusDistribution.map(s => ({
                status: s.status,
                count: s._count.id,
            })),
        };
    }

    /**
     * Historical contribution trends
     */
    async getContributionHistory() {
        // Aggregating by month or round across all Equbs
        const contributions = await this.prisma.contribution.findMany({
            where: { status: ContributionStatus.CONFIRMED },
            select: {
                amount: true,
                createdAt: true,
                roundNumber: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 100, // Limit for trend analysis
        });

        // Simple grouping by date for trend
        const trends = contributions.reduce((acc, c) => {
            const date = c.createdAt.toISOString().split('T')[0];
            if (!acc[date]) acc[date] = 0;
            acc[date] += Number(c.amount);
            return acc;
        }, {});

        return {
            history: Object.entries(trends).map(([date, amount]) => ({ date, amount })),
            totalVolume: contributions.reduce((sum, c) => sum + Number(c.amount), 0),
        };
    }

    /**
     * Historical payout trends
     */
    async getPayoutHistory() {
        const payouts = await this.prisma.payout.findMany({
            where: { status: PayoutStatus.EXECUTED },
            select: {
                amount: true,
                executedAt: true,
            },
            orderBy: { executedAt: 'desc' },
        });

        const trends = payouts.reduce((acc, p) => {
            if (!p.executedAt) return acc;
            const date = p.executedAt.toISOString().split('T')[0];
            if (!acc[date]) acc[date] = 0;
            acc[date] += Number(p.amount);
            return acc;
        }, {});

        return {
            history: Object.entries(trends).map(([date, amount]) => ({ date, amount })),
            totalPayoutVolume: payouts.reduce((sum, p) => sum + Number(p.amount), 0),
        };
    }

    /**
     * Member participation rates / engagement
     */
    async getMemberEngagement() {
        // Average contribution per member across all Equbs
        const memberships = await this.prisma.membership.count();
        const confirmedContributions = await this.prisma.contribution.count({
            where: { status: ContributionStatus.CONFIRMED },
        });

        return {
            globalParticipationRate: memberships > 0 ? (confirmedContributions / (memberships * 10)) * 100 : 0, // Mocked 10 rounds avg
            contributionDensity: confirmedContributions,
            memberships,
        };
    }

    /**
     * Export derived analytics in CSV format
     */
    async getExportData(type: 'contributions' | 'payouts' | 'summary') {
        if (type === 'contributions') {
            const data = await this.prisma.contribution.findMany({
                include: { member: { select: { fullName: true } }, equb: { select: { name: true } } },
                orderBy: { createdAt: 'desc' },
                take: 500,
            });
            const header = 'Equb,Member,Amount,Status,Round,Date\n';
            const rows = data.map(c => `"${c.equb.name}","${c.member.fullName}",${c.amount},${c.status},${c.roundNumber},${c.createdAt.toISOString()}`).join('\n');
            return header + rows;
        }

        if (type === 'payouts') {
            const data = await this.prisma.payout.findMany({
                include: { recipient: { select: { fullName: true } }, equb: { select: { name: true } } },
                orderBy: { executedAt: 'desc' },
                take: 500,
            });
            const header = 'Equb,Recipient,Amount,Status,Round,Date\n';
            const rows = data.map(p => `"${p.equb.name}","${p.recipient.fullName}",${p.amount},${p.status},${p.roundNumber},${p.executedAt?.toISOString() || ''}`).join('\n');
            return header + rows;
        }

        const summary = await this.getEqubAnalyticsSummary();
        return JSON.stringify(summary, null, 2);
    }
}
