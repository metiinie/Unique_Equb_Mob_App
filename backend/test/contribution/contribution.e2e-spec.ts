import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import { GlobalRole, ContributionStatus, EqubStatus, MembershipStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Contribution API Integration Test Suite
 * 
 * Tests all contribution endpoints with proper auth, RBAC, and business rules
 */
describe('Contribution API (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    // Test users
    const adminUser = {
        id: 'test-admin-id',
        email: 'admin@test.equb',
        passwordHash: '',
        fullName: 'Test Admin',
        role: GlobalRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const collectorUser = {
        id: 'test-collector-id',
        email: 'collector@test.equb',
        passwordHash: '',
        fullName: 'Test Collector',
        role: GlobalRole.COLLECTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const memberUser = {
        id: 'test-member-id',
        email: 'member@test.equb',
        passwordHash: '',
        fullName: 'Test Member',
        role: GlobalRole.MEMBER,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const memberUser2 = {
        id: 'test-member-2-id',
        email: 'member2@test.equb',
        passwordHash: '',
        fullName: 'Test Member 2',
        role: GlobalRole.MEMBER,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    // Test Equb
    const testEqub = {
        id: 'test-equb-id',
        name: 'Test Savings Group',
        totalRounds: 5,
        currentRound: 1,
        amount: 1000,
        currency: 'ETB',
        frequency: 'MONTHLY',
        roundCycleLength: 30,
        status: EqubStatus.ACTIVE,
        createdByUserId: 'test-admin-id',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const draftEqub = {
        id: 'draft-equb-id',
        name: 'Draft Equb',
        totalRounds: 3,
        currentRound: 0,
        amount: 500,
        currency: 'ETB',
        frequency: 'MONTHLY',
        roundCycleLength: 30,
        status: EqubStatus.DRAFT,
        createdByUserId: 'test-admin-id',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    // Helper function to login and get cookie
    async function loginAs(email: string, password: string = 'Test123!'): Promise<string[]> {
        const response = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({ email, password });

        return response.get('Set-Cookie');
    }

    // Full cleanup wiping everything
    async function fullCleanUp() {
        await prisma.contribution.deleteMany({});
        await prisma.payout.deleteMany({});
        await prisma.membership.deleteMany({});
        await prisma.auditEvent.deleteMany({});
        await prisma.equb.deleteMany({});
        await prisma.user.deleteMany({});
    }

    // Partial cleanup preserving Master Data (Users, Equbs, Memberships)
    async function resetState() {
        await prisma.contribution.deleteMany({});
        await prisma.payout.deleteMany({});
        await prisma.auditEvent.deleteMany({});
    }

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.use(cookieParser());
        app.setGlobalPrefix('api/v1');
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );

        await app.init();

        prisma = moduleFixture.get<PrismaService>(PrismaService);

        await fullCleanUp();

        // Create test users with hashed passwords
        const passwordHash = await bcrypt.hash('Test123!', 10);
        adminUser.passwordHash = passwordHash;
        collectorUser.passwordHash = passwordHash;
        memberUser.passwordHash = passwordHash;
        memberUser2.passwordHash = passwordHash;

        // Seed test data
        await prisma.user.createMany({
            data: [adminUser, collectorUser, memberUser, memberUser2],
        });

        await prisma.equb.createMany({
            data: [testEqub, draftEqub],
        });

        // Create memberships
        await prisma.membership.createMany({
            data: [
                {
                    equbId: testEqub.id,
                    userId: adminUser.id,
                    role: 'ADMIN',
                    status: MembershipStatus.ACTIVE,
                },
                {
                    equbId: testEqub.id,
                    userId: collectorUser.id,
                    role: 'COLLECTOR',
                    status: MembershipStatus.ACTIVE,
                },
                {
                    equbId: testEqub.id,
                    userId: memberUser.id,
                    role: 'MEMBER',
                    status: MembershipStatus.ACTIVE,
                },
                {
                    equbId: testEqub.id,
                    userId: memberUser2.id,
                    role: 'MEMBER',
                    status: MembershipStatus.ACTIVE,
                },
            ],
        });
    });

    afterEach(async () => {
        await resetState();
    });

    afterAll(async () => {
        // Full cleanup in correct order to avoid foreign key constraints
        await prisma.contribution.deleteMany({});
        await prisma.payout.deleteMany({});
        await prisma.membership.deleteMany({});
        await prisma.auditEvent.deleteMany({});
        await prisma.equb.deleteMany({});
        await prisma.user.deleteMany({});

        await app.close();
    });

    describe('POST /equbs/:id/contribute', () => {
        it('✅ MEMBER can create contribution with correct amount', async () => {
            const cookie = await loginAs(memberUser.email);

            const response = await request(app.getHttpServer())
                .post(`/api/v1/equbs/${testEqub.id}/contribute`)
                .set('Cookie', cookie)
                .send({ amount: 1000 });

            expect(response.status).toBe(201);
            expect(response.body).toMatchObject({
                equbId: testEqub.id,
                memberId: memberUser.id,
                roundNumber: 1,
                amount: '1000',
                status: ContributionStatus.PENDING,
            });
        });

        it('❌ Duplicate contribution returns 409 Conflict', async () => {
            const cookie = await loginAs(memberUser.email);

            // First contribution
            await request(app.getHttpServer())
                .post(`/api/v1/equbs/${testEqub.id}/contribute`)
                .set('Cookie', cookie)
                .send({ amount: 1000 });

            // Duplicate contribution
            const response = await request(app.getHttpServer())
                .post(`/api/v1/equbs/${testEqub.id}/contribute`)
                .set('Cookie', cookie)
                .send({ amount: 1000 });

            expect(response.status).toBe(409);
            expect(response.body.message).toContain('Duplicate contribution');
        });

        it('❌ Wrong amount returns 400 Bad Request', async () => {
            const cookie = await loginAs(memberUser.email);

            const response = await request(app.getHttpServer())
                .post(`/api/v1/equbs/${testEqub.id}/contribute`)
                .set('Cookie', cookie)
                .send({ amount: 500 }); // Expected: 1000

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Invalid contribution amount');
        });

        it('❌ Contribution to DRAFT Equb returns 409 Conflict', async () => {
            const cookie = await loginAs(memberUser.email);

            const response = await request(app.getHttpServer())
                .post(`/api/v1/equbs/${draftEqub.id}/contribute`)
                .set('Cookie', cookie)
                .send({ amount: 500 });

            expect(response.status).toBe(409);
            expect(response.body.message).toContain('DRAFT');
        });

        it('❌ ADMIN cannot contribute (MEMBER only)', async () => {
            const cookie = await loginAs(adminUser.email);

            const response = await request(app.getHttpServer())
                .post(`/api/v1/equbs/${testEqub.id}/contribute`)
                .set('Cookie', cookie)
                .send({ amount: 1000 });

            expect(response.status).toBe(403);
            expect(response.body.message).toContain('MEMBER');
        });

        it('❌ No authentication returns 401 Unauthorized', async () => {
            const response = await request(app.getHttpServer())
                .post(`/api/v1/equbs/${testEqub.id}/contribute`)
                .send({ amount: 1000 });

            expect(response.status).toBe(401);
        });

        it('❌ Invalid amount validation', async () => {
            const cookie = await loginAs(memberUser.email);

            const responses = await Promise.all([
                // Negative amount
                request(app.getHttpServer())
                    .post(`/api/v1/equbs/${testEqub.id}/contribute`)
                    .set('Cookie', cookie)
                    .send({ amount: -100 }),

                // Zero amount
                request(app.getHttpServer())
                    .post(`/api/v1/equbs/${testEqub.id}/contribute`)
                    .set('Cookie', cookie)
                    .send({ amount: 0 }),

                // Non-numeric amount
                request(app.getHttpServer())
                    .post(`/api/v1/equbs/${testEqub.id}/contribute`)
                    .set('Cookie', cookie)
                    .send({ amount: 'invalid' }),
            ]);

            responses.forEach(response => {
                expect(response.status).toBe(400);
            });
        });
    });

    describe('POST /contributions/:id/confirm', () => {
        let contributionId: string;

        beforeEach(async () => {
            // Create a pending contribution
            const cookie = await loginAs(memberUser.email);
            const response = await request(app.getHttpServer())
                .post(`/api/v1/equbs/${testEqub.id}/contribute`)
                .set('Cookie', cookie)
                .send({ amount: 1000 });

            contributionId = response.body.id;
        });

        it('✅ ADMIN can confirm contribution', async () => {
            const cookie = await loginAs(adminUser.email);

            const response = await request(app.getHttpServer())
                .post(`/api/v1/contributions/${contributionId}/confirm`)
                .set('Cookie', cookie);

            expect(response.status).toBe(200);
            expect(response.body.status).toBe(ContributionStatus.CONFIRMED);
        });

        it('✅ COLLECTOR can confirm contribution for assigned Equb', async () => {
            const cookie = await loginAs(collectorUser.email);

            const response = await request(app.getHttpServer())
                .post(`/api/v1/contributions/${contributionId}/confirm`)
                .set('Cookie', cookie);

            expect(response.status).toBe(200);
            expect(response.body.status).toBe(ContributionStatus.CONFIRMED);
        });

        it('❌ MEMBER cannot confirm contribution', async () => {
            const cookie = await loginAs(memberUser2.email);

            const response = await request(app.getHttpServer())
                .post(`/api/v1/contributions/${contributionId}/confirm`)
                .set('Cookie', cookie);

            expect(response.status).toBe(403);
        });

        it('❌ Already confirmed contribution returns 409', async () => {
            const cookie = await loginAs(adminUser.email);

            // First confirmation
            await request(app.getHttpServer())
                .post(`/api/v1/contributions/${contributionId}/confirm`)
                .set('Cookie', cookie);

            // Second confirmation attempt
            const response = await request(app.getHttpServer())
                .post(`/api/v1/contributions/${contributionId}/confirm`)
                .set('Cookie', cookie);

            expect(response.status).toBe(409);
            expect(response.body.message).toContain('already');
        });
    });

    describe('POST /contributions/:id/reject', () => {
        let contributionId: string;

        beforeEach(async () => {
            const cookie = await loginAs(memberUser.email);
            const response = await request(app.getHttpServer())
                .post(`/api/v1/equbs/${testEqub.id}/contribute`)
                .set('Cookie', cookie)
                .send({ amount: 1000 });

            contributionId = response.body.id;
        });

        it('✅ ADMIN can reject contribution with reason', async () => {
            const cookie = await loginAs(adminUser.email);

            const response = await request(app.getHttpServer())
                .post(`/api/v1/contributions/${contributionId}/reject`)
                .set('Cookie', cookie)
                .send({ reason: 'Invalid payment proof provided' });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe(ContributionStatus.REJECTED);
        });

        it('❌ Rejection without reason returns 400', async () => {
            const cookie = await loginAs(adminUser.email);

            const response = await request(app.getHttpServer())
                .post(`/api/v1/contributions/${contributionId}/reject`)
                .set('Cookie', cookie)
                .send({});

            expect(response.status).toBe(400);
        });

        it('❌ Reason too short returns 400', async () => {
            const cookie = await loginAs(adminUser.email);

            const response = await request(app.getHttpServer())
                .post(`/api/v1/contributions/${contributionId}/reject`)
                .set('Cookie', cookie)
                .send({ reason: 'Bad' }); // Less than 5 characters

            expect(response.status).toBe(400);
        });

        it('❌ MEMBER cannot reject contribution', async () => {
            const cookie = await loginAs(memberUser2.email);

            const response = await request(app.getHttpServer())
                .post(`/api/v1/contributions/${contributionId}/reject`)
                .set('Cookie', cookie)
                .send({ reason: 'Should not work' });

            expect(response.status).toBe(403);
        });
    });

    describe('GET /equbs/:id/contributions', () => {
        beforeEach(async () => {
            // Create contributions from multiple members
            const member1Cookie = await loginAs(memberUser.email);
            const member2Cookie = await loginAs(memberUser2.email);

            await request(app.getHttpServer())
                .post(`/api/v1/equbs/${testEqub.id}/contribute`)
                .set('Cookie', member1Cookie)
                .send({ amount: 1000 });

            await request(app.getHttpServer())
                .post(`/api/v1/equbs/${testEqub.id}/contribute`)
                .set('Cookie', member2Cookie)
                .send({ amount: 1000 });
        });

        it('✅ ADMIN sees all contributions', async () => {
            const cookie = await loginAs(adminUser.email);

            const response = await request(app.getHttpServer())
                .get(`/api/v1/equbs/${testEqub.id}/contributions`)
                .set('Cookie', cookie);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
        });

        it('✅ COLLECTOR sees all contributions for assigned Equb', async () => {
            const cookie = await loginAs(collectorUser.email);

            const response = await request(app.getHttpServer())
                .get(`/api/v1/equbs/${testEqub.id}/contributions`)
                .set('Cookie', cookie);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
        });

        it('✅ MEMBER sees only their own contributions', async () => {
            const cookie = await loginAs(memberUser.email);

            const response = await request(app.getHttpServer())
                .get(`/api/v1/equbs/${testEqub.id}/contributions`)
                .set('Cookie', cookie);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].memberId).toBe(memberUser.id);
        });

        it('✅ Round filtering works', async () => {
            const cookie = await loginAs(adminUser.email);

            const response = await request(app.getHttpServer())
                .get(`/api/v1/equbs/${testEqub.id}/contributions?round=1`)
                .set('Cookie', cookie);

            expect(response.status).toBe(200);
            expect(response.body.every((c: any) => c.roundNumber === 1)).toBe(true);
        });
    });

    describe('GET /contributions/my', () => {
        it('✅ MEMBER gets their contributions across all Equbs', async () => {
            const cookie = await loginAs(memberUser.email);

            await request(app.getHttpServer())
                .post(`/api/v1/equbs/${testEqub.id}/contribute`)
                .set('Cookie', cookie)
                .send({ amount: 1000 });

            const response = await request(app.getHttpServer())
                .get('/api/v1/contributions/my')
                .set('Cookie', cookie);

            expect(response.status).toBe(200);
            expect(response.body.every((c: any) => c.memberId === memberUser.id)).toBe(true);
        });
    });

    describe('GET /equbs/:id/round-summary/:round', () => {
        beforeEach(async () => {
            const member1Cookie = await loginAs(memberUser.email);
            const member2Cookie = await loginAs(memberUser2.email);
            const adminCookie = await loginAs(adminUser.email);

            // Create and confirm one contribution
            const response1 = await request(app.getHttpServer())
                .post(`/api/v1/equbs/${testEqub.id}/contribute`)
                .set('Cookie', member1Cookie)
                .send({ amount: 1000 });

            await request(app.getHttpServer())
                .post(`/api/v1/contributions/${response1.body.id}/confirm`)
                .set('Cookie', adminCookie);

            // Create pending contribution
            await request(app.getHttpServer())
                .post(`/api/v1/equbs/${testEqub.id}/contribute`)
                .set('Cookie', member2Cookie)
                .send({ amount: 1000 });
        });

        it('✅ ADMIN gets round summary with correct statistics', async () => {
            const cookie = await loginAs(adminUser.email);

            const response = await request(app.getHttpServer())
                .get(`/api/v1/equbs/${testEqub.id}/round-summary/1`)
                .set('Cookie', cookie);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                equbId: testEqub.id,
                roundNumber: 1,
                totalMembers: 2,
                confirmedContributions: 1,
                pendingContributions: 1,
                rejectedContributions: 0,
            });
            expect(response.body.collectionRate).toBeGreaterThan(0);
        });

        it('❌ MEMBER cannot access round summary', async () => {
            const cookie = await loginAs(memberUser.email);

            const response = await request(app.getHttpServer())
                .get(`/api/v1/equbs/${testEqub.id}/round-summary/1`)
                .set('Cookie', cookie);

            expect(response.status).toBe(403);
        });
    });

    describe('Concurrency Test (Race Condition)', () => {
        beforeEach(async () => {
            // Ensure clean state for concurrency test
            await resetState();
        });

        it('✅ Only one contribution succeeds when submitted concurrently', async () => {
            const cookie = await loginAs(memberUser.email);

            // Simulate concurrent requests
            const promises = Array(5).fill(null).map(() =>
                request(app.getHttpServer())
                    .post(`/api/v1/equbs/${testEqub.id}/contribute`)
                    .set('Cookie', cookie)
                    .send({ amount: 1000 })
            );

            const responses = await Promise.all(promises);

            const successCount = responses.filter(r => r.status === 201).length;
            const conflictCount = responses.filter(r => r.status === 409).length;

            expect(successCount).toBe(1);
            expect(conflictCount).toBe(4);

            // Verify only one contribution in DB
            const contributions = await prisma.contribution.findMany({
                where: {
                    equbId: testEqub.id,
                    memberId: memberUser.id,
                    roundNumber: 1,
                },
            });

            expect(contributions).toHaveLength(1);
        });
    });
});
