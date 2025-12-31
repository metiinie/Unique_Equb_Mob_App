import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        const url = process.env.DATABASE_URL;
        if (!url) {
            throw new Error('DATABASE_URL is not defined in .env');
        }

        super({
            datasources: {
                db: {
                    url: url,
                },
            },
            log: ['query', 'info', 'warn', 'error'],
        });
    }

    async onModuleInit() {
        let retries = 5;
        while (retries > 0) {
            try {
                await this.$connect();
                this.logger.log('Successfully connected to Neon database via Prisma.');
                return;
            } catch (error: any) {
                this.logger.error(`Failed to connect to Neon database (retries left: ${retries}): ${error.message}`);
                retries--;
                if (retries === 0) {
                    this.logger.error('Max retries reached. Could not connect to database.');
                } else {
                    this.logger.log('Retrying in 5 seconds...');
                    await new Promise(res => setTimeout(res, 5000));
                }
            }
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
