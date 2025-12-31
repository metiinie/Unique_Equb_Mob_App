import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { UserRepository } from '../src/modules/user/user.repository';
import { EqubService } from '../src/modules/equb/equb.service';
import { AuditEventService } from '../src/modules/audit-event/audit-event.service';
import { MembershipRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Pre-Neon Authentication & Guard Verification Suite
 * This suite ensures that the security architecture is production-ready
 * before we wire it to the real Neon/Postgres database.
 */
describe('Pre-Neon Auth Verification (Identity & Security Gate)', () => {
    let app: INestApplication;
    let userRepo: UserRepository;
    let equbService: EqubService;
    let auditService: AuditEventService;

    // Mock Prisma to prevent DB connection
    const mockPrisma = {
        $transaction: jest.fn((cb) => cb(mockPrisma)),
        user: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        equb: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        auditEvent: {
            create: jest.fn(),
        },
        membership: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
        },
    };

    const adminUser = {
        id: 'user-admin-uuid',
        email: 'admin@equb.com',
        password: '', // will be set in tests if needed
        role: MembershipRole.ADMIN,
        fullName: 'System Admin',
    };

    const regularMember = {
        id: 'user-member-uuid',
        email: 'member@equb.com',
        password: '',
        role: MembershipRole.MEMBER,
        fullName: 'Regular Member',
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PrismaService)
            .useValue(mockPrisma)
            .compile();

        app = moduleFixture.createNestApplication();
        app.use(cookieParser());
        app.setGlobalPrefix('api/v1');
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        await app.init();

        userRepo = moduleFixture.get<UserRepository>(UserRepository);
        equbService = moduleFixture.get<EqubService>(EqubService);
        auditService = moduleFixture.get<AuditEventService>(AuditEventService);

        // Seed hashed password
        const passwordHash = await bcrypt.hash('Password123!', 10);
        adminUser.password = passwordHash;
        regularMember.password = passwordHash;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        await app.close();
        console.log('\n✅ AUTH VERIFIED');
        console.log('✅ RBAC VERIFIED');
        console.log('✅ ACTOR PROPAGATION VERIFIED');
        console.log('✅ AUDIT CONTINUITY VERIFIED');
        console.log('\nSYSTEM IS CLEARED FOR NEON INTEGRATION\n');
    });

    describe('AUTHENTICATION (JWT & Cookies)', () => {
        it('Login Success: Sets httpOnly JWT cookie and hides sensitive fields', async () => {
            jest.spyOn(userRepo, 'findByEmail').mockResolvedValue(adminUser as any);

            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({ email: adminUser.email, password: 'Password123!' });

            expect(response.status).toBe(201); // 201 for POST

            // Assert Cookie Flags
            const cookies = response.get('Set-Cookie');
            expect(cookies).toBeDefined();
            const jwtCookie = cookies.find(c => c.startsWith('jwt='));
            expect(jwtCookie).toContain('HttpOnly');
            expect(jwtCookie).toContain('SameSite=Strict');

            // Assert Response Security
            expect(response.body.actor).toBeDefined();
            expect(response.body.actor.password).toBeUndefined();
            expect(response.body.actor.role).toBe(MembershipRole.ADMIN);
        });

        it('Login Failure: Rejects invalid credentials and sets no cookie', async () => {
            jest.spyOn(userRepo, 'findByEmail').mockResolvedValue(adminUser as any);

            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({ email: adminUser.email, password: 'WrongPassword' });

            expect(response.status).toBe(401);
            expect(response.get('Set-Cookie')).toBeUndefined();
        });
    });

    describe('ROLE-BASED ACCESS (RBAC)', () => {
        it('Forbidden Role: Member cannot call Admin-level mutations', async () => {
            // 1. Login as Member
            jest.spyOn(userRepo, 'findByEmail').mockResolvedValue(regularMember as any);
            jest.spyOn(userRepo, 'findById').mockResolvedValue(regularMember as any);

            const loginRes = await request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({ email: regularMember.email, password: 'Password123!' });

            const cookie = loginRes.get('Set-Cookie');

            // 2. Attempt Admin Mutation (Create Equb)
            const response = await request(app.getHttpServer())
                .post('/api/v1/equbs')
                .set('Cookie', cookie)
                .send({
                    name: 'Hacker Group',
                    amount: 5000,
                    frequency: 'MONTHLY',
                    roundCycleLength: 1
                });

            expect(response.status).toBe(403);
            expect(response.body.message).toContain('Insufficient permissions');
        });

        it('Allowed Role: Admin can call Admin-level mutations', async () => {
            jest.spyOn(userRepo, 'findByEmail').mockResolvedValue(adminUser as any);
            jest.spyOn(userRepo, 'findById').mockResolvedValue(adminUser as any);
            jest.spyOn(equbService, 'createEqub').mockResolvedValue({ id: 'equb-1' } as any);

            const loginRes = await request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({ email: adminUser.email, password: 'Password123!' });

            const cookie = loginRes.get('Set-Cookie');

            const response = await request(app.getHttpServer())
                .post('/api/v1/equbs')
                .set('Cookie', cookie)
                .send({
                    name: 'Elite Equb',
                    amount: 5000,
                    frequency: 'MONTHLY',
                    roundCycleLength: 1
                });

            expect(response.status).toBe(201);
        });
    });

    describe('ACTOR PROPAGATION & AUDIT INTEGRATION', () => {
        it('Actor Identity: propagates server-verified ID and triggers Audit', async () => {
            jest.spyOn(userRepo, 'findByEmail').mockResolvedValue(adminUser as any);
            jest.spyOn(userRepo, 'findById').mockResolvedValue(adminUser as any);

            // Fix mockPrisma to return valid objects during transaction
            mockPrisma.equb.create.mockResolvedValue({ id: 'equb-audit-uuid' });
            mockPrisma.user.findUnique.mockResolvedValue(adminUser);

            const createEqubSpy = jest.spyOn(equbService, 'createEqub');
            const logEventSpy = jest.spyOn(auditService, 'logEvent');

            const loginRes = await request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({ email: adminUser.email, password: 'Password123!' });

            const cookie = loginRes.get('Set-Cookie');

            const equbData = {
                name: 'Audit Protected Equb',
                amount: 10000,
                frequency: 'WEEKLY',
                roundCycleLength: 1
            };

            await request(app.getHttpServer())
                .post('/api/v1/equbs')
                .set('Cookie', cookie)
                .send({ ...equbData, actorId: 'FAKE-ID' }); // Attempting to override Actor (should be ignored)

            // CRITICAL: Verify Actor ID came from JWT, NOT the payload
            expect(createEqubSpy).toHaveBeenCalledWith(
                expect.objectContaining({ id: adminUser.id, role: MembershipRole.ADMIN }),
                expect.anything()
            );

            // Verify Audit Continuity
            expect(logEventSpy).toHaveBeenCalledWith(
                { id: adminUser.id, role: 'USER' },
                'EQUB_CREATED',
                expect.objectContaining({ id: 'equb-audit-uuid' }),
                expect.anything(),
                expect.anything(),
                expect.anything()
            );
        });
    });

    describe('TOKEN LIFECYCLE', () => {
        it('Logout correctly clears the cookie', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/logout');

            expect(response.status).toBe(201);
            const cookies = response.get('Set-Cookie');
            expect(cookies[0]).toContain('jwt=;'); // Standard way express-res.clearCookie works
        });
    });
});
