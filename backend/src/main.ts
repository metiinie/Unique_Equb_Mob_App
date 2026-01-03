import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { SystemStatusService } from './modules/common/system-status.service';
import { FinancialMetricsService } from './modules/reporting/financial-metrics.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());

    // Global Prefix
    app.setGlobalPrefix('api/v1');

    app.use((req, res, next) => {
        console.log(`[Backend] Incoming: ${req.method} ${req.url} | Origin: ${req.headers.origin}`);
        next();
    });

    app.enableCors({
        origin: true, // In production, replace with specific domain
        credentials: true,
    });

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));

    app.enableShutdownHooks();

    // STARTUP INTEGRITY CHECK (Phase 9)
    // We implement a retry mechanism for DB cold-starts (Neon)
    let retryCount = 0;
    const MAX_RETRIES = 3;
    const logger = new Logger('Bootstrap');

    while (retryCount < MAX_RETRIES) {
        try {
            const systemStatus = app.get(SystemStatusService);
            const metricsService = app.get(FinancialMetricsService);

            logger.log(`Running Startup Integrity Check (Attempt ${retryCount + 1}/${MAX_RETRIES})...`);
            const integrity = await metricsService.performIntegrityCheck();

            const passed = integrity.status === 'OK';
            systemStatus.setStartupIntegrityResult(passed);

            if (!passed) {
                logger.warn('System starting in DEGRADED mode due to integrity violations.');
            }
            break; // Success or Degraded (Handled) -> proceed to listen
        } catch (e) {
            retryCount++;
            logger.error(`Integrity Check Failed (Attempt ${retryCount}/${MAX_RETRIES}): ${e.message}`);

            if (retryCount >= MAX_RETRIES) {
                logger.error('CRITICAL: Startup Integrity Check failed after max retries. Aborting.');
                process.exit(1);
            }

            // Wait 2 seconds before retry
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
