import { CanActivate, ExecutionContext, Injectable, ServiceUnavailableException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SystemStatusService } from '../../modules/common/system-status.service';
import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to mark endpoints as FINANCIAL_WRITE.
 */
export const FinancialWrite = () => SetMetadata('isFinancialWrite', true);

@Injectable()
export class SystemSafetyGuard implements CanActivate {
    private readonly logger = new Logger(SystemSafetyGuard.name);

    constructor(
        private reflector: Reflector,
        private systemStatus: SystemStatusService
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const isFinancialWrite = this.reflector.get<boolean>('isFinancialWrite', context.getHandler());

        if (isFinancialWrite && this.systemStatus.isDegraded) {
            this.logger.warn('Blocked financial write operation due to DEGRADED system status.');
            throw new ServiceUnavailableException('System is in DEGRADED mode. Financial writes are disabled.');
        }

        return true;
    }
}
