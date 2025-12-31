import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import { GlobalRole, EqubStatus, MembershipStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('State Machine Enforcement (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    const adminUser = {
        id: 'state-admin-id',
        email: 'state_admin@test.equb',
        passwordHash: '',
        fullName: 'State Admin',
        role: GlobalRole.ADMIN,
    };

    const memberUser = {
        id: 'state-member-id',
        email: 'state_member@test.equb',
        passwordHash: '',
        fullName: 'State Member',
        role: GlobalRole.MEMBER,
    };

    async function loginAs(email: string) {
        const response = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({ email, password: 'Password123!' });
        return response.get('Set-Cookie');
    }

    async function cleanUp() {
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

        await cleanUp();
        await prisma.user.createMany({ data: [adminUser, memberUser] });
    });

    afterAll(async () => {
        await cleanUp();
        await app.close();
    });

    describe('State Guard Enforcement', () => {
        let equbId: string;

        beforeEach(async () => {
            await prisma.payout.deleteMany();
            await prisma.contribution.deleteMany();
            await prisma.membership.deleteMany();
            await prisma.equb.deleteMany();

            const equb = await prisma.equb.create({
                data: {
                    name: 'State Test Equb',
                    totalRounds: 2,
                    amount: 1000,
                    status: EqubStatus.DRAFT,
                    createdByUserId: adminUser.id,
                }
            });
            equbId = equb.id;

            await prisma.membership.create({
                data: {
                    equbId,
                    userId: memberUser.id,
                    role: 'MEMBER',
                    status: MembershipStatus.ACTIVE
                }
            });
            // Need at least 2 members to activate (as per EqubService logic)
            await prisma.membership.create({
                data: {
                    equbId,
                    userId: adminUser.id,
                    role: 'ADMIN',
                    status: MembershipStatus.ACTIVE
                }
            });
        });

        it('❌ Cannot contribute to DRAFT Equb', async () => {
            const cookie = await loginAs(memberUser.email);
            const response = await request(app.getHttpServer())
                .post(`/api/v1/equbs/${equbId}/contribute`)
                .set('Cookie', cookie)
                .send({ amount: 1000 });

            expect(response.status).toBe(409);
            expect(response.body.message).toContain('DRAFT');
        });

        it('❌ Cannot execute payout for DRAFT Equb', async () => {
            const cookie = await loginAs(adminUser.email);
            const response = await request(app.getHttpServer())
                .post(`/api/v1/equbs/${equbId}/payouts/execute`)
                .set('Cookie', cookie);

            expect(response.status).toBe(409);
        });

        it('❌ Cannot activate an already ACTIVE Equb', async () => {
            // Activate first
            const cookie = await loginAs(adminUser.email);
            await request(app.getHttpServer())
                .post(`/api/v1/equbs/${equbId}/activate`)
                .set('Cookie', cookie);

            // Try activating again
            const response = await request(app.getHttpServer())
                .post(`/api/v1/equbs/${equbId}/activate`)
                .set('Cookie', cookie);

            expect(response.status).toBe(409);
            expect(response.body.message).toContain('DRAFT');
        });

        it('❌ Terminal State: COMPLETED Equb rejects mutations', async () => {
            const cookie = await loginAs(adminUser.email);

            // Mark as COMPLETED
            await prisma.equb.update({
                where: { id: equbId },
                data: { status: EqubStatus.COMPLETED }
            });

            // 1. Try adding member
            const responseAdd = await request(app.getHttpServer())
                .post('/api/v1/memberships')
                .set('Cookie', cookie)
                .send({ equbId, userId: 'some-other-id' });
            expect(responseAdd.status).toBe(409);

            // 2. Try contributing
            const memberCookie = await loginAs(memberUser.email);
            const responseContribute = await request(app.getHttpServer())
                .post(`/api/v1/equbs/${equbId}/contribute`)
                .set('Cookie', memberCookie)
                .send({ amount: 1000 });
            expect(responseContribute.status).toBe(409);

            // 3. Try payout
            const responsePayout = await request(app.getHttpServer())
                .post(`/api/v1/equbs/${equbId}/payouts/execute`)
                .set('Cookie', cookie);
            expect(responsePayout.status).toBe(409);
        });
    });
});
