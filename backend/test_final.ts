import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function test() {
    const url = process.env.DATABASE_URL;
    console.log('Testing connection to:', url?.replace(/:[^:@]+@/, ':****@'));

    if (!url) return;

    try {
        const sql = neon(url);
        const result = await sql`SELECT version()`;
        console.log('SUCCESS:', result);
    } catch (error: any) {
        console.error('FAILED:', error.message);
    }
}

test();
