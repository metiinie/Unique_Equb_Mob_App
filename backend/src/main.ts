import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

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

    await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
