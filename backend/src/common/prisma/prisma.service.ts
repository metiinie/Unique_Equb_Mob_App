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
            log: [
                { emit: 'event', level: 'query' },
                { emit: 'event', level: 'info' },
                { emit: 'event', level: 'warn' },
                { emit: 'event', level: 'error' },
            ],
        });
    }

    async onModuleInit() {
        try {
            this.logger.log('Connecting to database...');
            await this.$connect();
            this.logger.log('✅ Database connection established successfully.');
        } catch (error: any) {
            this.logger.error(`❌ FATAL: Failed to connect to database: ${error.message}`, error.stack);
            // We do NOT retry indefinitely causing loops. We fail fast to restart.
            throw error;
        }
    }

    async onModuleDestroy() {
        this.logger.log('Disconnecting from database...');
        await this.$disconnect();
        this.logger.log('✅ Database connection closed.');
    }
}
