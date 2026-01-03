import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { FinancialMetricsService } from './financial-metrics.service';
import { AuditEventService } from '../audit-event/audit-event.service';
import { SystemStatusService } from '../common/system-status.service';
import { LedgerReplayService } from './ledger-replay.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { GlobalRole, AuditActionType } from '@prisma/client';

@Controller('system')
export class SystemController {
    constructor(
        private readonly metricsService: FinancialMetricsService,
        private readonly auditService: AuditEventService,
        private readonly systemStatusService: SystemStatusService,
        private readonly replayService: LedgerReplayService,
    ) { }

    /**
     * [READ_ONLY] [ADMIN_OPERATION]
     */
    @Get('financial-health')
    @Roles(GlobalRole.ADMIN)
    async getFinancialHealth() {
        return this.metricsService.getGlobalMetrics();
    }

    /**
     * [READ_ONLY] [ADMIN_OPERATION]
     */
    @Get('integrity-check')
    @Roles(GlobalRole.ADMIN)
    async runIntegrityCheck() {
        return this.metricsService.performIntegrityCheck();
    }

    /**
     * [READ_ONLY]
     * Phase 9: Release Identity
     */
    @Get('version')
    async getVersion() {
        return this.systemStatusService.versionInfo;
    }

    /**
     * [READ_ONLY] [ADMIN_OPERATION]
     * Phase 10: Ledger Integrity Verification
     */
    @Get('integrity/drift/:equbId')
    @Roles(GlobalRole.ADMIN)
    async getLedgerDrift(@Param('equbId') equbId: string) {
        return this.replayService.detectDrift(equbId);
    }
}
