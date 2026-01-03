import { Test, TestingModule } from '@nestjs/testing';
import { PayoutService } from './payout.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditEventService } from '../audit-event/audit-event.service';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { GlobalRole, EqubStatus, PayoutStatus, AuditActionType, MembershipStatus, MembershipRole } from '@prisma/client';

describe('PayoutService', () => {
    let service: PayoutService;
    let prisma: {
        $transaction: jest.Mock;
        payout: { findUnique: jest.Mock; findMany: jest.Mock; create: jest.Mock; count: jest.Mock; findFirst: jest.Mock };
        equb: { findUnique: jest.Mock; update: jest.Mock };
        membership: { findUnique: jest.Mock };
        contribution: { count: jest.Mock; updateMany: jest.Mock; findMany: jest.Mock };
    };
    let auditService: { logEvent: jest.Mock };

    const mockAdmin = {
        id: 'admin-id',
        role: GlobalRole.ADMIN,
        email: 'admin@test.com',
        fullName: 'Admin',
        notificationPreferences: {},
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: 'hash',
    };
    const mockCollector = {
        id: 'collector-id',
        role: GlobalRole.COLLECTOR,
        email: 'collector@test.com',
        fullName: 'Collector',
        notificationPreferences: {},
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: 'hash',
    };
    const mockMember = {
        id: 'member-id',
        role: GlobalRole.MEMBER,
        email: 'member@test.com',
        fullName: 'Member',
        notificationPreferences: {},
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: 'hash',
    };

    const mockEqubId = 'equb-id';
    const mockRecipinetId = 'recipient-id';

    beforeEach(async () => {
        prisma = {
            $transaction: jest.fn((cb) => cb(prisma)),
            payout: {
                findUnique: jest.fn().mockResolvedValue(null),
                findMany: jest.fn().mockResolvedValue([]),
                create: jest.fn(),
                count: jest.fn().mockResolvedValue(0),
                findFirst: jest.fn().mockResolvedValue(null),
            },
            equb: {
                findUnique: jest.fn().mockResolvedValue(null),
                update: jest.fn(),
            },
            membership: {
                findUnique: jest.fn().mockResolvedValue(null),
            },
            contribution: {
                count: jest.fn().mockResolvedValue(0),
                updateMany: jest.fn().mockResolvedValue({ count: 0 }),
                findMany: jest.fn().mockResolvedValue([]),
            },
        };

        auditService = {
            logEvent: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PayoutService,
                { provide: PrismaService, useValue: prisma },
                { provide: AuditEventService, useValue: auditService },
            ],
        }).compile();

        service = module.get<PayoutService>(PayoutService);
    });

    describe('executePayout', () => {
        const mockEqub = {
            id: mockEqubId,
            status: EqubStatus.ACTIVE,
            currentRound: 1,
            totalRounds: 10,
            amount: 1000,
            memberships: [
                { userId: 'recipient-id', status: MembershipStatus.ACTIVE, role: MembershipRole.MEMBER, joinedAt: new Date(1000) },
                { userId: 'other-id', status: MembershipStatus.ACTIVE, role: MembershipRole.MEMBER, joinedAt: new Date(2000) },
            ],
            payouts: [],
        };

        it('should execute payout successfully for ADMIN', async () => {
            prisma.equb.findUnique.mockResolvedValue(mockEqub);
            prisma.contribution.count.mockResolvedValue(2); // 2 active members
            prisma.payout.findUnique.mockResolvedValue(null); // No existing payout
            prisma.payout.create.mockResolvedValue({
                id: 'payout-id',
                equbId: mockEqubId,
                roundNumber: 1,
                recipientUserId: 'recipient-id',
                amount: 2000, // 1000 * 2 members
                status: PayoutStatus.EXECUTED,
                recipient: { fullName: 'Recipient Name' },
            });
            prisma.contribution.findMany.mockResolvedValue([
                { amount: 1000 },
                { amount: 1000 }
            ]);
            prisma.equb.update.mockResolvedValue({ ...mockEqub, currentRound: 2 });

            const result = await service.executePayout(mockAdmin, mockEqubId);

            expect(result.status).toBe(PayoutStatus.EXECUTED);
            expect(prisma.equb.update).toHaveBeenCalledWith({
                where: { id: mockEqubId },
                data: { currentRound: 2, status: EqubStatus.ACTIVE },
            });
            expect(auditService.logEvent).toHaveBeenCalledWith(
                expect.anything(),
                AuditActionType.PAYOUT_COMPLETED,
                expect.anything(),
                expect.anything(),
            );
        });

        it('should execute payout successfully for COLLECTOR', async () => {
            prisma.equb.findUnique.mockResolvedValue(mockEqub);
            prisma.contribution.count.mockResolvedValue(2);
            prisma.payout.findUnique.mockResolvedValue(null);
            prisma.payout.create.mockResolvedValue({
                id: 'payout-id',
                status: PayoutStatus.EXECUTED,
                recipient: { fullName: 'Recipient Name' },
            });
            prisma.contribution.findMany.mockResolvedValue([
                { amount: 1000 },
                { amount: 1000 }
            ]);

            await service.executePayout(mockCollector, mockEqubId);
            expect(prisma.payout.create).toHaveBeenCalled();
        });

        it('should throw ForbiddenException for MEMBER', async () => {
            await expect(service.executePayout(mockMember, mockEqubId))
                .rejects.toThrow(ForbiddenException);
        });

        it('should throw ConflictException if Equb is not ACTIVE', async () => {
            prisma.equb.findUnique.mockResolvedValue({ ...mockEqub, status: EqubStatus.COMPLETED });
            await expect(service.executePayout(mockAdmin, mockEqubId))
                .rejects.toThrow(ConflictException);
        });

        it('should throw BadRequestException if contributions incomplete', async () => {
            prisma.equb.findUnique.mockResolvedValue(mockEqub);
            prisma.contribution.count.mockResolvedValue(1); // Only 1 paid, 2 expected

            await expect(service.executePayout(mockAdmin, mockEqubId))
                .rejects.toThrow('Round not fully funded');
        });

        it('should throw ConflictException if payout already exists for round', async () => {
            prisma.equb.findUnique.mockResolvedValue(mockEqub);
            prisma.contribution.count.mockResolvedValue(2);
            prisma.payout.findUnique.mockResolvedValue({ id: 'existing' });

            await expect(service.executePayout(mockAdmin, mockEqubId))
                .rejects.toThrow('Payout already executed for this round');
        });

        it('should throw ConflictException if reconciliation fails (amount mismatch)', async () => {
            prisma.equb.findUnique.mockResolvedValue(mockEqub);
            prisma.contribution.count.mockResolvedValue(2);
            prisma.payout.findUnique.mockResolvedValue(null);
            prisma.payout.create.mockResolvedValue({ id: 'payout', amount: 2000 });

            // Mock settled contributions with WRONG sum
            prisma.contribution.findMany.mockResolvedValue([
                { amount: 1000 },
                { amount: 500 } // Total 1500, expected 2000
            ]);

            await expect(service.executePayout(mockAdmin, mockEqubId))
                .rejects.toThrow('Financial reconciliation failed');
        });

        it('should throw ConflictException if no eligible members found', async () => {
            const equbAllWinners = {
                ...mockEqub,
                payouts: [
                    { recipientUserId: 'recipient-id' },
                    { recipientUserId: 'other-id' }
                ],
            };
            // We need to mock payout.findMany for eligible recipients check
            prisma.payout.findMany.mockResolvedValue([
                { recipientUserId: 'recipient-id' },
                { recipientUserId: 'other-id' }
            ]);
            prisma.equb.findUnique.mockResolvedValue(equbAllWinners);
            prisma.contribution.count.mockResolvedValue(2);
            prisma.payout.findUnique.mockResolvedValue(null);

            await expect(service.executePayout(mockAdmin, mockEqubId))
                .rejects.toThrow('No eligible recipients remaining');
        });

        it('should mark Equb as COMPLETED if final round', async () => {
            const finalRoundEqub = { ...mockEqub, currentRound: 10, totalRounds: 10 };
            prisma.equb.findUnique.mockResolvedValue(finalRoundEqub);
            prisma.contribution.count.mockResolvedValue(2);
            prisma.payout.findUnique.mockResolvedValue(null);
            prisma.payout.create.mockResolvedValue({ id: 'payout', status: PayoutStatus.EXECUTED, amount: 2000, recipient: { fullName: 'Recipient' } });
            prisma.contribution.findMany.mockResolvedValue([{ amount: 1000 }, { amount: 1000 }]);

            await service.executePayout(mockAdmin, mockEqubId);

            expect(prisma.equb.update).toHaveBeenCalledWith({
                where: { id: mockEqubId },
                data: { currentRound: 11, status: EqubStatus.COMPLETED },
            });
            // Should verify audit log for Equb Completion
            expect(auditService.logEvent).toHaveBeenCalledWith(
                expect.anything(),
                AuditActionType.EQUB_COMPLETED,
                expect.anything(),
                expect.anything(),
            );
        });
    });

    describe('getPayouts', () => {
        it('should return all payouts for ADMIN', async () => {
            prisma.payout.findMany.mockResolvedValue([{ id: '1' }, { id: '2' }]);
            const result = await service.getPayouts(mockAdmin, mockEqubId);
            expect(result).toHaveLength(2);
        });

        it('should return only own payouts for MEMBER', async () => {
            prisma.payout.findMany.mockResolvedValue([{ id: '1', recipientUserId: mockMember.id }]);
            await service.getPayouts(mockMember, mockEqubId);
            expect(prisma.payout.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ recipientUserId: mockMember.id }),
            }));
        });
    });
});
