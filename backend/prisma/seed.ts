import { PrismaClient, GlobalRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Clear existing users (optional - comment out if you want to preserve existing data)
    // await prisma.user.deleteMany({});

    const hashedPassword = await bcrypt.hash('Test123!', 10);

    // Create ADMIN user
    const admin = await prisma.user.upsert({
        where: { email: 'admin@equb.test' },
        update: {},
        create: {
            email: 'admin@equb.test',
            passwordHash: hashedPassword,
            fullName: 'Admin User',
            role: GlobalRole.ADMIN,
        },
    });

    // Create COLLECTOR user
    const collector = await prisma.user.upsert({
        where: { email: 'collector@equb.test' },
        update: {},
        create: {
            email: 'collector@equb.test',
            passwordHash: hashedPassword,
            fullName: 'Collector User',
            role: GlobalRole.COLLECTOR,
        },
    });

    // Create MEMBER users
    const member1 = await prisma.user.upsert({
        where: { email: 'member1@equb.test' },
        update: {},
        create: {
            email: 'member1@equb.test',
            passwordHash: hashedPassword,
            fullName: 'Member One',
            role: GlobalRole.MEMBER,
        },
    });

    const member2 = await prisma.user.upsert({
        where: { email: 'member2@equb.test' },
        update: {},
        create: {
            email: 'member2@equb.test',
            passwordHash: hashedPassword,
            fullName: 'Member Two',
            role: GlobalRole.MEMBER,
        },
    });

    const member3 = await prisma.user.upsert({
        where: { email: 'member3@equb.test' },
        update: {},
        create: {
            email: 'member3@equb.test',
            passwordHash: hashedPassword,
            fullName: 'Member Three',
            role: GlobalRole.MEMBER,
        },
    });

    console.log('✅ Seed completed successfully!');
    console.log('\n📋 Test User Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`ADMIN:     admin@equb.test / Test123!`);
    console.log(`COLLECTOR: collector@equb.test / Test123!`);
    console.log(`MEMBER 1:  member1@equb.test / Test123!`);
    console.log(`MEMBER 2:  member2@equb.test / Test123!`);
    console.log(`MEMBER 3:  member3@equb.test / Test123!`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('User IDs for reference:');
    console.log(`ADMIN ID:     ${admin.id}`);
    console.log(`COLLECTOR ID: ${collector.id}`);
    console.log(`MEMBER1 ID:   ${member1.id}`);
    console.log(`MEMBER2 ID:   ${member2.id}`);
    console.log(`MEMBER3 ID:   ${member3.id}`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
