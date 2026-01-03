import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GlobalRole, EqubStatus, PayoutStatus, ContributionStatus, MembershipStatus, MembershipRole } from '@prisma/client';

@Injectable()
export class ReportingService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * ADMIN: Global System Overview
     */
    async getAdminGlobalSummary() {
        const [equbCount, userCount, activeEqubs] = await Promise.all([
            this.prisma.equb.count(),
            this.prisma.user.count(),
            this.prisma.equb.count({ where: { status: EqubStatus.ACTIVE } }),
        ]);

        return {
            totalEqubs: equbCount,
            totalUsers: userCount,
            activeEqubs: activeEqubs,
        };
    }

    /**
     * ADMIN/COLLECTOR: Equb Health (Quantitative Only)
     */
    async getEqubMetrics(actor: { id: string, role: string }, equbId: string) {
        // Enforce Scoping for Collector
        if (actor.role === GlobalRole.COLLECTOR) {
            const membership = await this.prisma.membership.findUnique({
                where: { equbId_userId: { equbId, userId: actor.id } }
            });
            if (!membership || membership.status !== MembershipStatus.ACTIVE) {
                throw new ForbiddenException('Access Denied: You are not assigned to this Equb');
            }
        }

        const [equb, membersCount, contributions] = await Promise.all([
            this.prisma.equb.findUnique({
                where: { id: equbId },
                select: {
                    id: true,
                    name: true,
                    status: true,
                    currentRound: true,
                    totalRounds: true,
                }
            }),
            this.prisma.membership.count({ where: { equbId } }),
            this.prisma.contribution.findMany({
                where: { equbId },
                select: { status: true }
            }),
        ]);

        if (!equb) throw new NotFoundException('Equb not found');

        const totalExpected = contributions.length;
        const confirmedCount = contributions.filter(c => c.status === ContributionStatus.CONFIRMED).length;

        return {
            ...equb,
            totalMembers: membersCount,
            contributionStats: {
                totalExpected,
                totalConfirmed: confirmedCount,
                percentConfirmed: totalExpected > 0 ? Number(((confirmedCount / totalExpected) * 100).toFixed(2)) : 0,
            }
        };
    }

    /**
     * MEMBER: Dashboard Data (Strict Scoping)
     */
    async getMemberDashboard(userId: string) {
        const memberships = await this.prisma.membership.findMany({
            where: { userId, status: MembershipStatus.ACTIVE },
            select: {
                equb: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                        currentRound: true,
                        totalRounds: true,
                        amount: true,
                        frequency: true,
                        _count: {
                            select: { memberships: true }
                        }
                    }
                }
            }
        });

        // Updated to use new Contribution schema (memberId, amount, createdAt)
        const myContributions = await this.prisma.contribution.findMany({
            where: { memberId: userId },
            select: {
                id: true,
                equbId: true,
                roundNumber: true,
                amount: true,
                status: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        const equbIds = memberships.map(m => m.equb.id);
        const pastPayouts = await this.prisma.payout.findMany({
            where: {
                equbId: { in: equbIds },
                status: PayoutStatus.EXECUTED
            },
            select: {
                roundNumber: true,
                amount: true,
                executedAt: true,
                equb: { select: { name: true } }
            },
            orderBy: { executedAt: 'desc' },
            take: 5
        });

        return {
            myEqubs: memberships.map(m => m.equb),
            recentContributions: myContributions,
            executedPayouts: pastPayouts.map(p => ({
                equbName: p.equb.name,
                round: p.roundNumber,
                amount: p.amount,
                date: p.executedAt
            }))
        };
    }

    async getCollectorSummary(userId: string) {
        const memberships = await this.prisma.membership.findMany({
            where: { userId, role: MembershipRole.COLLECTOR, status: MembershipStatus.ACTIVE },
            include: {
                equb: {
                    include: {
                        _count: {
                            select: { memberships: true }
                        }
                    }
                }
            }
        });

        // Simple aggregation for now
        const assignedEqubs = memberships.map(m => m.equb);
        const totalTarget = assignedEqubs.reduce((acc, e) => acc + Number(e.amount) * (e._count.memberships - 1), 0);

        const assignedEqubIds = assignedEqubs.map(e => e.id);

        const confirmedContributions = await this.prisma.contribution.aggregate({
            where: {
                equbId: { in: assignedEqubIds },
                status: ContributionStatus.CONFIRMED,
            },
            _sum: { amount: true }
        });

        return {
            assignedEqubs,
            totalTarget,
            totalCollected: confirmedContributions._sum.amount || 0,
        };
    }

    /**
     * READ-ONLY: Contribution Report
     */
    async getContributionReport(equbId?: string, round?: number) {
        return this.prisma.contribution.findMany({
            where: {
                ...(equbId && { equbId }),
                ...(round && { roundNumber: round }),
            },
            include: {
                member: { select: { fullName: true, email: true } },
                equb: { select: { name: true } },
            },
            orderBy: [{ equbId: 'asc' }, { roundNumber: 'desc' }],
        });
    }

    /**
     * READ-ONLY: Payout Report
     */
    async getPayoutReport(equbId?: string, round?: number) {
        return this.prisma.payout.findMany({
            where: {
                ...(equbId && { equbId }),
                ...(round && { roundNumber: round }),
            },
            include: {
                recipient: { select: { fullName: true, email: true } },
                equb: { select: { name: true } },
            },
            orderBy: [{ equbId: 'asc' }, { roundNumber: 'desc' }],
        });
    }

    /**
     * Phase 6: Generate exportable ledger report
     */
    async generateLedgerReport(equbId: string, format: 'json' | 'csv') {
        const equb = await this.prisma.equb.findUnique({
            where: { id: equbId },
            include: {
                payouts: {
                    include: { recipient: { select: { fullName: true } } },
                    orderBy: { roundNumber: 'asc' }
                },
                contributions: {
                    where: { status: ContributionStatus.SETTLED },
                    include: { member: { select: { fullName: true } } }
                }
            }
        });

        if (!equb) throw new NotFoundException('Equb not found');

        const rounds = Array.from({ length: equb.currentRound > 0 ? equb.currentRound : 0 }, (_, i) => i + 1);

        const reportData = rounds.map(roundNum => {
            const payout = equb.payouts.find(p => p.roundNumber === roundNum);
            const roundContributions = equb.contributions.filter(c => c.roundNumber === roundNum);
            const totalContributed = roundContributions.reduce((sum, c) => sum + Number(c.amount), 0);

            return {
                round: roundNum,
                payoutRecipient: payout?.recipient.fullName || 'N/A',
                payoutAmount: payout ? Number(payout.amount) : 0,
                totalContributed,
                contributionCount: roundContributions.length,
                status: payout ? 'EXECUTED' : 'PENDING',
                checksum: `SIG_${equbId}_${roundNum}_${totalContributed}`
            };
        });

        if (format === 'json') {
            return reportData;
        }

        // CSV Generation
        const headers = ['Round', 'Recipient', 'Payout Amount', 'Total Contributed', 'Contribution Count', 'Status', 'Checksum'];
        const rows = reportData.map(r => [
            r.round,
            `"${r.payoutRecipient}"`,
            r.payoutAmount,
            r.totalContributed,
            r.contributionCount,
            r.status,
            r.checksum
        ]);

        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }
}
