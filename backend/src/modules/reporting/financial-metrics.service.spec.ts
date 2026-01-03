import { Test, TestingModule } from '@nestjs/testing';
import { FinancialMetricsService } from './financial-metrics.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PayoutStatus, EqubStatus, ContributionStatus, MembershipStatus, MembershipRole } from '@prisma/client';

describe('FinancialMetricsService', () => {
    let service: FinancialMetricsService;
    let prisma: {
        contribution: { aggregate: jest.Mock; findMany: jest.Mock };
        payout: { aggregate: jest.Mock; findMany: jest.Mock };
        equb: { aggregate: jest.Mock };
    };

    beforeEach(async () => {
        prisma = {
            contribution: { aggregate: jest.fn(), findMany: jest.fn() },
            payout: { aggregate: jest.fn(), findMany: jest.fn() },
            equb: { aggregate: jest.fn() },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FinancialMetricsService,
                { provide: PrismaService, useValue: prisma },
            ],
        }).compile();

        service = module.get<FinancialMetricsService>(FinancialMetricsService);
    });

    describe('getGlobalMetrics', () => {
        it('should return zero metrics when db is empty', async () => {
            prisma.contribution.aggregate.mockResolvedValue({ _sum: { amount: null } });
            prisma.payout.aggregate.mockResolvedValue({ _sum: { amount: null }, _count: { id: 0 } });
            prisma.equb.aggregate.mockResolvedValue({ _count: { id: 0 } });
            prisma.payout.findMany.mockResolvedValue([]); // Integrity check passes

            const metrics = await service.getGlobalMetrics();

            expect(metrics.totalContributionsReceived).toBe(0);
            expect(metrics.totalVolumeProcessed).toBe(0);
            expect(metrics.discrepancyCount).toBe(0);
            expect(metrics.isDegraded).toBe(false);
        });

        it('should correctly sum contributions and payouts', async () => {
            prisma.contribution.aggregate.mockResolvedValue({ _sum: { amount: 5000 } });
            prisma.payout.aggregate.mockResolvedValue({ _sum: { amount: 4800 }, _count: { id: 4 } });
            prisma.equb.aggregate.mockResolvedValue({ _count: { id: 1 } });
            prisma.payout.findMany.mockResolvedValue([]); // Integrity check passes

            const metrics = await service.getGlobalMetrics();

            expect(metrics.totalContributionsReceived).toBe(5000);
            expect(metrics.totalVolumeProcessed).toBe(4800);
            expect(metrics.totalPayoutsExecuted).toBe(4);
            expect(metrics.totalEqubsCompleted).toBe(1);
        });
    });

    describe('performIntegrityCheck', () => {
        it('should report OK when all ledgers match', async () => {
            const mockPayouts = [
                {
                    id: 'p1',
                    amount: 1000,
                    equbId: 'e1',
                    roundNumber: 1,
                    equb: { memberships: [{ userId: 'u1' }, { userId: 'u2' }] } // 2 members
                }
            ];
            prisma.payout.findMany.mockResolvedValue(mockPayouts);

            // Mock matching contributions
            prisma.contribution.findMany.mockResolvedValue([
                { amount: 500 }, { amount: 500 }
            ]);

            const result = await service.performIntegrityCheck();

            expect(result.status).toBe('OK');
            expect(result.violations).toHaveLength(0);
        });

        it('should report DEGRADED and list violations on amount mismatch', async () => {
            const mockPayouts = [
                {
                    id: 'p1',
                    amount: 1000,
                    equbId: 'e1',
                    roundNumber: 1,
                    equb: { memberships: [{ userId: 'u1' }, { userId: 'u2' }] }
                }
            ];
            prisma.payout.findMany.mockResolvedValue(mockPayouts);

            // Mock MISMATCHING contributions (only 900 total)
            prisma.contribution.findMany.mockResolvedValue([
                { amount: 500 }, { amount: 400 }
            ]);

            const result = await service.performIntegrityCheck();

            expect(result.status).toBe('DEGRADED');
            expect(result.violations).toHaveLength(1);
            expect(result.violations[0]).toEqual(expect.objectContaining({
                equbId: 'e1',
                expectedAmount: 1000,
                actualAmount: 900
            }));
        });

        it('should report DEGRADED on member count mismatch', async () => {
            const mockPayouts = [
                {
                    id: 'p2',
                    amount: 1000,
                    equbId: 'e1',
                    roundNumber: 1,
                    equb: { memberships: [{ userId: 'u1' }, { userId: 'u2' }] } // 2 members expected
                }
            ];
            prisma.payout.findMany.mockResolvedValue(mockPayouts);

            // Mock only 1 contribution found
            prisma.contribution.findMany.mockResolvedValue([
                { amount: 1000 }
            ]);

            const result = await service.performIntegrityCheck();

            expect(result.status).toBe('DEGRADED');
            expect(result.violations[0]).toEqual(expect.objectContaining({
                expectedCount: 2,
                actualCount: 1
            }));
        });
    });
});
