import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GlobalRole, EqubStatus, PayoutStatus, ContributionStatus, MembershipStatus } from '@prisma/client';

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
}
