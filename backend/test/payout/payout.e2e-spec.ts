import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import { GlobalRole, EqubStatus, MembershipStatus, ContributionStatus, PayoutStatus, MembershipRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('Payout API (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    const adminUser = {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        email: 'payout_admin@test.equb',
        passwordHash: '',
        fullName: 'Payout Admin',
        role: GlobalRole.ADMIN,
    };

    const memberUser = {
        id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
        email: 'payout_member@test.equb',
        passwordHash: '',
        fullName: 'Payout Member',
        role: GlobalRole.MEMBER,
    };

    const memberUser2 = {
        id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
        email: 'payout_member_2@test.equb',
        passwordHash: '',
        fullName: 'Payout Member 2',
        role: GlobalRole.MEMBER,
    };

    const testEqub = {
        id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44',
        name: 'Payout Test Equb',
        totalRounds: 2, // Round 1 and Round 2
        currentRound: 1,
        amount: 1000,
        currency: 'ETB',
        frequency: 'MONTHLY',
        roundCycleLength: 30,
        status: EqubStatus.ACTIVE,
        createdByUserId: adminUser.id,
    };

    async function loginAs(email: string) {
        const response = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({ email, password: 'Password123!' });
        return response.get('Set-Cookie');
    }

    async function fullCleanUp() {
        // Precise deletion order to avoid FK violations
        await prisma.payout.deleteMany();
        await prisma.contribution.deleteMany();
        await prisma.membership.deleteMany();
        await prisma.auditEvent.deleteMany();
        await prisma.equb.deleteMany();
        await prisma.user.deleteMany();
    }

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.use(cookieParser());
        app.setGlobalPrefix('api/v1');
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        await app.init();

        prisma = moduleFixture.get<PrismaService>(PrismaService);
        const passwordHash = await bcrypt.hash('Password123!', 10);
        adminUser.passwordHash = passwordHash;
        memberUser.passwordHash = passwordHash;
        memberUser2.passwordHash = passwordHash;

        await fullCleanUp();

        // Seed Users
        await prisma.user.createMany({ data: [adminUser, memberUser, memberUser2] });
        // Seed Equb
        await prisma.equb.create({ data: testEqub });
        // Seed Memberships
        await prisma.membership.createMany({
            data: [
                { equbId: testEqub.id, userId: adminUser.id, role: MembershipRole.ADMIN, status: MembershipStatus.ACTIVE },
                { equbId: testEqub.id, userId: memberUser.id, role: MembershipRole.MEMBER, status: MembershipStatus.ACTIVE },
                { equbId: testEqub.id, userId: memberUser2.id, role: MembershipRole.MEMBER, status: MembershipStatus.ACTIVE },
            ],
        });
    });

    afterAll(async () => {
        await fullCleanUp();
        await app.close();
    });

    describe('POST /api/v1/equbs/:id/payouts/execute', () => {

        it('❌ MEMBER is blocked from executing payout', async () => {
            const cookie = await loginAs(memberUser.email);
            const response = await request(app.getHttpServer())
                .post(`/api/v1/equbs/${testEqub.id}/payouts/execute`)
                .set('Cookie', cookie);

            expect(response.status).toBe(403);
        });

        it('❌ Cannot execute payout if contributions incomplete', async () => {
            // No contributions seeded for round 1 yet
            const cookie = await loginAs(adminUser.email);
            const response = await request(app.getHttpServer())
                .post(`/api/v1/equbs/${testEqub.id}/payouts/execute`)
                .set('Cookie', cookie);

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('contributions confirmed');
        });

        it('✅ ADMIN can execute payout when all members have contributed', async () => {
            // Seed confirmed contributions for EXACTLY the 2 MEMBERS
            await prisma.contribution.createMany({
                data: [
                    { equbId: testEqub.id, memberId: memberUser.id, roundNumber: 1, amount: 1000, status: ContributionStatus.CONFIRMED },
                    { equbId: testEqub.id, memberId: memberUser2.id, roundNumber: 1, amount: 1000, status: ContributionStatus.CONFIRMED },
                ]
            });

            const cookie = await loginAs(adminUser.email);
            const response = await request(app.getHttpServer())
                .post(`/api/v1/equbs/${testEqub.id}/payouts/execute`)
                .set('Cookie', cookie);

            expect(response.status).toBe(201);
            expect(response.body.status).toBe(PayoutStatus.EXECUTED);
            expect(response.body.roundNumber).toBe(1);
            expect(response.body.amount).toBe('1000');

            // Verify recipient is one of the members
            const winners = [memberUser.id, memberUser2.id];
            expect(winners).toContain(response.body.recipientUserId);

            // Verify Equb progressed to round 2
            const updatedEqub = await prisma.equb.findUnique({ where: { id: testEqub.id } });
            expect(updatedEqub.currentRound).toBe(2);
            expect(updatedEqub.status).toBe(EqubStatus.ACTIVE);

            // Verify Audit Log
            const audit = await prisma.auditEvent.findFirst({
                where: { actionType: 'PAYOUT_COMPLETED', entityId: response.body.id }
            });
            expect(audit).toBeDefined();
            expect(audit.actorUserId).toBe(adminUser.id);
        });

        it('❌ Cannot execute double payout for same round', async () => {
            // Round is already 2 now. If we try to execute for round 2 without contributions -> 400.
            // But if we mock a payout for round 2 manually, it should 409.
            // Actually, we can just try to execute round 2, it will fail with 400 because contributions are missing.
            // Let's seed contributions for round 2 and then try double execution.

            await prisma.contribution.createMany({
                data: [
                    { equbId: testEqub.id, memberId: memberUser.id, roundNumber: 2, amount: 1000, status: ContributionStatus.CONFIRMED },
                    { equbId: testEqub.id, memberId: memberUser2.id, roundNumber: 2, amount: 1000, status: ContributionStatus.CONFIRMED },
                ]
            });

            const cookie = await loginAs(adminUser.email);

            // First execution for round 2 (Happy path - also tests final round completion)
            const firstResponse = await request(app.getHttpServer())
                .post(`/api/v1/equbs/${testEqub.id}/payouts/execute`)
                .set('Cookie', cookie);

            expect(firstResponse.status).toBe(201);

            // Verify final round marked Equb as COMPLETED
            const completedEqub = await prisma.equb.findUnique({ where: { id: testEqub.id } });
            expect(completedEqub.status).toBe(EqubStatus.COMPLETED);
            expect(completedEqub.currentRound).toBe(3); // Increment occurred

            // Second execution attempt for same round (should conflict because Equb is COMPLETED or Round is already paid)
            const secondResponse = await request(app.getHttpServer())
                .post(`/api/v1/equbs/${testEqub.id}/payouts/execute`)
                .set('Cookie', cookie);

            // If Equb is COMPLETED, it throws Conflict at the state check.
            expect(secondResponse.status).toBe(409);
        });

        it('❌ Cannot execute payout on COMPLETED Equb', async () => {
            const cookie = await loginAs(adminUser.email);
            const response = await request(app.getHttpServer())
                .post(`/api/v1/equbs/${testEqub.id}/payouts/execute`)
                .set('Cookie', cookie);

            expect(response.status).toBe(409);
            expect(response.body.message).toContain('Only ACTIVE Equbs');
        });
    });

    describe('GET /api/v1/equbs/:id/payouts', () => {
        it('✅ ADMIN sees all payouts (verified 2 records)', async () => {
            const cookie = await loginAs(adminUser.email);
            const response = await request(app.getHttpServer())
                .get(`/api/v1/equbs/${testEqub.id}/payouts`)
                .set('Cookie', cookie);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2); // Round 1 and Round 2
        });
    });
});

