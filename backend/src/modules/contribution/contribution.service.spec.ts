import { Test, TestingModule } from '@nestjs/testing';
import { ContributionService } from './contribution.service';
import { ContributionRepository } from './contribution.repository';
import { AuditEventService } from '../audit-event/audit-event.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
    GlobalRole,
    ContributionStatus,
    EqubStatus,
    MembershipStatus,
    AuditActionType,
} from '@prisma/client';
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
} from '@nestjs/common';

describe('ContributionService (Unit Tests)', () => {
    let service: ContributionService;
    let repository: ContributionRepository;
    let auditService: AuditEventService;
    let prismaService: PrismaService;

    // Mock transaction context
    const mockTx = {
        equb: {
            findUnique: jest.fn(),
        },
        membership: {
            findUnique: jest.fn(),
        },
        contribution: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
        },
        payout: {
            findUnique: jest.fn(),
        },
    };

    const mockPrismaService = {
        $transaction: jest.fn((callback, options) => {
            if (typeof callback === 'function') return callback(mockTx);
            return Promise.all(callback.map(cb => cb(mockTx)));
        }),
        equb: { findUnique: jest.fn() },
        membership: { findMany: jest.fn(), findUnique: jest.fn() },
    };

    const mockRepository = {
        findByMemberAndRound: jest.fn(),
        create: jest.fn(),
        updateStatus: jest.fn(),
        findByEqub: jest.fn(),
        findByMember: jest.fn(),
        getRoundTotal: jest.fn(),
        countConfirmedContributions: jest.fn(),
    };

    const mockAuditService = {
        logEvent: jest.fn(),
    };

    const memberUser = {
        id: 'member-id',
        email: 'member@test.com',
        passwordHash: 'hash',
        fullName: 'Test Member',
        role: GlobalRole.MEMBER,
        notificationPreferences: {},
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const adminUser = {
        id: 'admin-id',
        email: 'admin@test.com',
        passwordHash: 'hash',
        fullName: 'Test Admin',
        role: GlobalRole.ADMIN,
        notificationPreferences: {},
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const collectorUser = {
        id: 'collector-id',
        email: 'collector@test.com',
        passwordHash: 'hash',
        fullName: 'Test Collector',
        role: GlobalRole.COLLECTOR,
        notificationPreferences: {},
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const activeEqub = {
        id: 'equb-id',
        name: 'Test Equb',
        totalRounds: 5,
        currentRound: 1,
        amount: 1000,
        currency: 'ETB',
        frequency: 'MONTHLY',
        roundCycleLength: 30,
        status: EqubStatus.ACTIVE,
        createdByUserId: 'admin-id',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const activeMembership = {
        equbId: 'equb-id',
        userId: 'member-id',
        role: 'MEMBER',
        status: MembershipStatus.ACTIVE,
        joinedAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ContributionService,
                {
                    provide: ContributionRepository,
                    useValue: mockRepository,
                },
                {
                    provide: AuditEventService,
                    useValue: mockAuditService,
                },
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<ContributionService>(ContributionService);
        repository = module.get<ContributionRepository>(ContributionRepository);
        auditService = module.get<AuditEventService>(AuditEventService);
        prismaService = module.get<PrismaService>(PrismaService);

        // Reset all mocks
        jest.clearAllMocks();
    });

    describe('createContribution', () => {
        it('should throw ForbiddenException if user role is not MEMBER', async () => {
            await expect(
                service.createContribution(adminUser, 'equb-id', 1, 1000),
            ).rejects.toThrow(ForbiddenException);

            await expect(
                service.createContribution(collectorUser, 'equb-id', 1, 1000),
            ).rejects.toThrow(ForbiddenException);
        });

        it('should throw BadRequestException if Equb not found', async () => {
            mockTx.equb.findUnique.mockResolvedValue(null);

            await expect(
                service.createContribution(memberUser, 'invalid-equb-id', 1, 1000),
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw ConflictException if Equb status is not ACTIVE', async () => {
            const draftEqub = { ...activeEqub, status: EqubStatus.DRAFT };
            mockTx.equb.findUnique.mockResolvedValue(draftEqub);

            await expect(
                service.createContribution(memberUser, 'equb-id', 1, 1000),
            ).rejects.toThrow('Equb not active');

            expect(mockTx.equb.findUnique).toHaveBeenCalledWith({
                where: { id: 'equb-id' },
            });
        });

        it('should throw BadRequestException if amount does not match Equb.amount', async () => {
            mockTx.equb.findUnique.mockResolvedValue(activeEqub);
            mockTx.membership.findUnique.mockResolvedValue(activeMembership);

            await expect(
                service.createContribution(memberUser, 'equb-id', 1, 500),
            ).rejects.toThrow('Incorrect amount');
        });

        it('should throw ForbiddenException if user is not a member of the Equb', async () => {
            mockTx.equb.findUnique.mockResolvedValue(activeEqub);
            mockTx.membership.findUnique.mockResolvedValue(null);

            await expect(
                service.createContribution(memberUser, 'equb-id', 1, 1000),
            ).rejects.toThrow(ForbiddenException);
        });

        it('should throw ConflictException if membership status is not ACTIVE', async () => {
            mockTx.equb.findUnique.mockResolvedValue(activeEqub);
            mockTx.membership.findUnique.mockResolvedValue({
                ...activeMembership,
                status: MembershipStatus.SUSPENDED,
            });

            await expect(
                service.createContribution(memberUser, 'equb-id', 1, 1000),
            ).rejects.toThrow(ForbiddenException);
        });

        it('should throw ConflictException if duplicate contribution exists', async () => {
            mockTx.equb.findUnique.mockResolvedValue(activeEqub);
            mockTx.membership.findUnique.mockResolvedValue(activeMembership);
            mockTx.contribution.findUnique.mockResolvedValue({
                id: 'existing-contribution',
                status: ContributionStatus.PENDING,
            });

            await expect(
                service.createContribution(memberUser, 'equb-id', 1, 1000),
            ).rejects.toThrow('Contribution already submitted');
        });

        it('should successfully create contribution when all rules are satisfied', async () => {
            mockTx.equb.findUnique.mockResolvedValue(activeEqub);
            mockTx.membership.findUnique.mockResolvedValue(activeMembership);
            mockTx.contribution.findUnique.mockResolvedValue(null);
            mockTx.contribution.count.mockResolvedValue(1);
            mockTx.contribution.create.mockResolvedValue({
                id: 'new-contribution-id',
                equbId: 'equb-id',
                memberId: 'member-id',
                roundNumber: 1,
                amount: 1000,
                status: ContributionStatus.CONFIRMED,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const result = await service.createContribution(memberUser, 'equb-id', 1, 1000);

            expect(result.contribution.status).toBe(ContributionStatus.CONFIRMED);
            expect(result.summary.confirmedCount).toBe(1);
            expect(mockAuditService.logEvent).toHaveBeenCalled();
        });
    });

    describe('confirmContribution', () => {
        const pendingContribution = {
            id: 'contribution-id',
            equbId: 'equb-id',
            memberId: 'member-id',
            roundNumber: 1,
            amount: 1000,
            status: ContributionStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
            equb: activeEqub,
            member: memberUser,
        };

        it('should throw ForbiddenException if actor is not ADMIN or COLLECTOR', async () => {
            await expect(
                service.confirmContribution(memberUser, 'contribution-id'),
            ).rejects.toThrow(ForbiddenException);
        });

        it('should throw BadRequestException if contribution not found', async () => {
            mockTx.contribution.findUnique.mockResolvedValue(null);

            await expect(
                service.confirmContribution(adminUser, 'invalid-id'),
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw ConflictException if contribution is not PENDING', async () => {
            mockTx.contribution.findUnique.mockResolvedValue({
                ...pendingContribution,
                status: ContributionStatus.CONFIRMED,
            });

            await expect(
                service.confirmContribution(adminUser, 'contribution-id'),
            ).rejects.toThrow(ConflictException);
        });

        it('should throw ForbiddenException if COLLECTOR is not assigned to the Equb', async () => {
            mockTx.contribution.findUnique.mockResolvedValue(pendingContribution);
            mockTx.membership.findUnique.mockResolvedValue(null);

            await expect(
                service.confirmContribution(collectorUser, 'contribution-id'),
            ).rejects.toThrow(ForbiddenException);
        });

        it('should successfully confirm contribution for ADMIN', async () => {
            mockTx.contribution.findUnique.mockResolvedValue(pendingContribution);
            mockTx.contribution.update.mockResolvedValue({
                ...pendingContribution,
                status: ContributionStatus.CONFIRMED,
            });

            const result = await service.confirmContribution(adminUser, 'contribution-id');

            expect(result.status).toBe(ContributionStatus.CONFIRMED);
            expect(mockAuditService.logEvent).toHaveBeenCalledWith(
                { id: adminUser.id, role: adminUser.role },
                AuditActionType.CONTRIBUTION_CONFIRMED,
                expect.anything(),
                expect.anything(),
            );
        });

        it('should successfully confirm contribution for assigned COLLECTOR', async () => {
            mockTx.contribution.findUnique.mockResolvedValue(pendingContribution);
            mockTx.membership.findUnique.mockResolvedValue({
                equbId: 'equb-id',
                userId: 'collector-id',
                status: MembershipStatus.ACTIVE,
            });
            mockTx.contribution.update.mockResolvedValue({
                ...pendingContribution,
                status: ContributionStatus.CONFIRMED,
            });

            const result = await service.confirmContribution(collectorUser, 'contribution-id');

            expect(result.status).toBe(ContributionStatus.CONFIRMED);
        });
    });

    describe('rejectContribution', () => {
        const pendingContribution = {
            id: 'contribution-id',
            equbId: 'equb-id',
            memberId: 'member-id',
            roundNumber: 1,
            amount: 1000,
            status: ContributionStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
            equb: activeEqub,
            member: memberUser,
        };

        it('should throw ForbiddenException if actor is not ADMIN or COLLECTOR', async () => {
            await expect(
                service.rejectContribution(memberUser, 'contribution-id', 'reason'),
            ).rejects.toThrow(ForbiddenException);
        });

        it('should throw BadRequestException if contribution not found', async () => {
            mockTx.contribution.findUnique.mockResolvedValue(null);

            await expect(
                service.rejectContribution(adminUser, 'invalid-id', 'reason'),
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw ConflictException if contribution is not PENDING', async () => {
            mockTx.contribution.findUnique.mockResolvedValue({
                ...pendingContribution,
                status: ContributionStatus.REJECTED,
            });

            await expect(
                service.rejectContribution(adminUser, 'contribution-id', 'reason'),
            ).rejects.toThrow(ConflictException);
        });

        it('should successfully reject contribution with reason', async () => {
            mockTx.contribution.findUnique.mockResolvedValue(pendingContribution);
            mockTx.contribution.update.mockResolvedValue({
                ...pendingContribution,
                status: ContributionStatus.REJECTED,
            });

            const result = await service.rejectContribution(
                adminUser,
                'contribution-id',
                'Invalid payment proof',
            );

            expect(result.status).toBe(ContributionStatus.REJECTED);
            expect(mockAuditService.logEvent).toHaveBeenCalledWith(
                { id: adminUser.id, role: adminUser.role },
                AuditActionType.CONTRIBUTION_REJECTED,
                expect.anything(),
                expect.objectContaining({ reason: 'Invalid payment proof' }),
            );
        });
    });

    describe('getContributions', () => {
        const mockContributions = [
            { id: '1', memberId: 'member-id', roundNumber: 1 },
            { id: '2', memberId: 'other-member-id', roundNumber: 1 },
        ];

        beforeEach(() => {
            mockPrismaService.equb.findUnique.mockResolvedValue(activeEqub);
        });

        it('should return all contributions for ADMIN', async () => {
            mockRepository.findByEqub.mockResolvedValue(mockContributions);

            const result = await service.getContributions(adminUser, 'equb-id');

            expect(result).toHaveLength(2);
            expect(mockRepository.findByEqub).toHaveBeenCalledWith('equb-id', undefined);
        });

        it('should return all contributions for assigned COLLECTOR', async () => {
            mockPrismaService.membership.findUnique.mockResolvedValue(activeMembership);
            mockRepository.findByEqub.mockResolvedValue(mockContributions);

            const result = await service.getContributions(collectorUser, 'equb-id');

            expect(result).toHaveLength(2);
        });

        it('should throw ForbiddenException for unassigned COLLECTOR', async () => {
            mockPrismaService.membership.findUnique.mockResolvedValue(null);

            await expect(
                service.getContributions(collectorUser, 'equb-id'),
            ).rejects.toThrow(ForbiddenException);
        });

        it('should return only own contributions for MEMBER', async () => {
            mockRepository.findByMember.mockResolvedValue([mockContributions[0]]);

            const result = await service.getContributions(memberUser, 'equb-id');

            expect(result).toHaveLength(1);
            expect(result[0].memberId).toBe('member-id');
        });

        it('should filter by round number', async () => {
            mockRepository.findByEqub.mockResolvedValue(mockContributions);

            await service.getContributions(adminUser, 'equb-id', 1);

            expect(mockRepository.findByEqub).toHaveBeenCalledWith('equb-id', 1);
        });
    });

    describe('getRoundSummary', () => {
        const mockEqubWithMemberships = {
            ...activeEqub,
            memberships: [
                activeMembership,
                { ...activeMembership, userId: 'member-2' },
                { ...activeMembership, userId: 'member-3' },
            ],
        };

        beforeEach(() => {
            mockPrismaService.equb.findUnique.mockResolvedValue(mockEqubWithMemberships);
        });

        it('should throw ForbiddenException if actor is MEMBER', async () => {
            await expect(
                service.getRoundSummary(memberUser, 'equb-id', 1),
            ).rejects.toThrow(ForbiddenException);
        });

        it('should return correct summary statistics for ADMIN', async () => {
            mockRepository.countConfirmedContributions.mockResolvedValue(2);
            mockRepository.getRoundTotal.mockResolvedValue(2000);
            mockRepository.findByEqub.mockResolvedValue([
                { status: ContributionStatus.CONFIRMED },
                { status: ContributionStatus.CONFIRMED },
                { status: ContributionStatus.PENDING },
            ]);

            const result = await service.getRoundSummary(adminUser, 'equb-id', 1);

            expect(result.totalMembers).toBe(3);
            expect(result.confirmedContributions).toBe(2);
            expect(result.pendingContributions).toBe(1);
            expect(result.rejectedContributions).toBe(0);
            expect(result.collectionRate).toBeGreaterThan(0);
        });
    });
});
