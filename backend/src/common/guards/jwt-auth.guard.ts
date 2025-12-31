import { Injectable, ExecutionContext, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger(JwtAuthGuard.name);

    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const endpoint = `${request.method} ${request.url}`;

        if (err || !user) {
            this.logger.warn(
                `🔐 Authentication Failed | Endpoint: ${endpoint} | IP: ${request.ip} | Reason: ${info?.message || err?.message || 'Unknown'}`
            );
            throw err || new UnauthorizedException('Authentication required');
        }

        this.logger.debug(
            `✅ Authenticated | User: ${user.email} | Role: ${user.role} | Endpoint: ${endpoint}`
        );

        return user;
    }
}
