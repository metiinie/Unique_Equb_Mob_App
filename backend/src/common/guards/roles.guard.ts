import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GlobalRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    private readonly logger = new Logger(RolesGuard.name);

    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }

        const requiredRoles = this.reflector.getAllAndOverride<GlobalRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const { user } = request;
        const endpoint = `${request.method} ${request.url}`;

        if (!user) {
            this.logger.error(`🚫 RBAC Failed | Endpoint: ${endpoint} | Reason: User context missing`);
            throw new ForbiddenException('User context missing');
        }

        const hasRole = requiredRoles.includes(user.role);

        if (!hasRole) {
            this.logger.warn(
                `🚫 Authorization Denied | User: ${user.email} | Role: ${user.role} | Required: [${requiredRoles.join(', ')}] | Endpoint: ${endpoint} | IP: ${request.ip}`
            );
            throw new ForbiddenException(`Access denied. Required roles: ${requiredRoles.join(', ')}`);
        }

        this.logger.debug(
            `✅ Authorized | User: ${user.email} | Role: ${user.role} | Endpoint: ${endpoint}`
        );

        return true;
    }
}
