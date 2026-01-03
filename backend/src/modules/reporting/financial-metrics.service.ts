import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PayoutStatus, EqubStatus, ContributionStatus, MembershipStatus, MembershipRole } from '@prisma/client';

@Injectable()
export class FinancialMetricsService {
    private readonly logger = new Logger(FinancialMetricsService.name);

    constructor(private readonly prisma: PrismaService) { }

    // =================================================================================================
    // 🛡️ DOMAIN GUARDRAILS ENFORCED 🛡️
    // This service is part of the FROZEN FINANCIAL CORE (Phase 7).
    // DO NOT modify Invariants without updating INVARIANTS.md and running full regression tests.
    // DIRECT PRISMA WRITES OUTSIDE THIS SERVICE FOR FINANCIAL METRICS ARE FORBIDDEN.
    // =================================================================================================

    /**
     * Compute global derived metrics
     */
    async getGlobalMetrics() {
        const [
            contributionsSum,
            payoutsStats,
            equbsStats,
            discrepancyData
        ] = await Promise.all([
            // totalContributionsReceived (CONFIRMED + SETTLED)
            this.prisma.contribution.aggregate({
                where: {
                    status: { in: [ContributionStatus.CONFIRMED, ContributionStatus.SETTLED as any] }
                },
                _sum: { amount: true }
            }),
            // totalPayoutsExecuted & totalVolumeProcessed
            this.prisma.payout.aggregate({
                where: { status: PayoutStatus.EXECUTED },
                _sum: { amount: true },
                _count: { id: true }
            }),
            // totalEqubsCompleted
            this.prisma.equb.aggregate({
                where: { status: EqubStatus.COMPLETED },
                _count: { id: true }
            }),
            // For discrepancy count, we need to perform an integrity check
            this.performIntegrityCheck()
        ]);

        return {
            totalContributionsReceived: Number(contributionsSum._sum.amount || 0),
            totalPayoutsExecuted: payoutsStats._count.id,
            totalVolumeProcessed: Number(payoutsStats._sum.amount || 0),
            totalRoundsCompleted: payoutsStats._count.id, // Every executed payout represents a completed round
            totalEqubsCompleted: equbsStats._count.id,
            discrepancyCount: discrepancyData.violations.length,
            isDegraded: discrepancyData.violations.length > 0,
            lastIntegrityCheckTimestamp: new Date(),
        };
    }

    /**
     * Re-runs reconciliation across all closed rounds
     */
    async performIntegrityCheck() {
        const violations: any[] = [];

        // Fetch all EXECUTED payouts
        const payouts = await this.prisma.payout.findMany({
            where: { status: PayoutStatus.EXECUTED },
            include: {
                equb: {
                    include: {
                        memberships: {
                            where: { role: MembershipRole.MEMBER, status: MembershipStatus.ACTIVE }
                        }
                    }
                }
            }
        });

        for (const payout of payouts) {
            // Check contributions for this equb and round
            const contributions = await this.prisma.contribution.findMany({
                where: {
                    equbId: payout.equbId,
                    roundNumber: payout.roundNumber,
                    status: ContributionStatus.SETTLED as any
                },
                select: { amount: true }
            });

            const totalAmount = contributions.reduce((sum, c) => sum + Number(c.amount), 0);
            const count = contributions.length;
            const expectedCount = payout.equb.memberships.length;

            if (totalAmount !== Number(payout.amount) || count !== expectedCount) {
                violations.push({
                    equbId: payout.equbId,
                    roundNumber: payout.roundNumber,
                    payoutId: payout.id,
                    actualAmount: totalAmount,
                    expectedAmount: Number(payout.amount),
                    actualCount: count,
                    expectedCount: expectedCount
                });
            }
        }

        return {
            status: violations.length === 0 ? 'OK' : 'DEGRADED',
            checkedCount: payouts.length,
            violations,
            timestamp: new Date()
        };
    }
}
