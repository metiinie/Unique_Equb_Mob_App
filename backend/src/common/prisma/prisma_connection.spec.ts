import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';

describe('Prisma Connection Stability Test', () => {
    let prisma: PrismaService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule.forRoot()],
            providers: [PrismaService],
        }).compile();

        prisma = module.get<PrismaService>(PrismaService);
        await prisma.onModuleInit();
    });

    afterAll(async () => {
        await prisma.onModuleDestroy();
    });

    it('should connect and successfully execute a count query on Users', async () => {
        // This confirms the handshake and query execution are stable
        const userCount = await prisma.user.count();
        expect(typeof userCount).toBe('number');
        console.log(`Database connectivity verified. User count: ${userCount}`);
    });
});
