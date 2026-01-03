import { Module } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { ReportingController } from './reporting.controller';
import { SystemController } from './system.controller';
import { AuditController } from './audit.controller';
import { FinancialMetricsService } from './financial-metrics.service';
import { SystemStatusService } from '../common/system-status.service';
import { LedgerReplayService } from './ledger-replay.service';

@Module({
    providers: [ReportingService, FinancialMetricsService, SystemStatusService, LedgerReplayService],
    controllers: [ReportingController, SystemController, AuditController],
    exports: [ReportingService, FinancialMetricsService, SystemStatusService, LedgerReplayService],
})
export class ReportingModule { }
