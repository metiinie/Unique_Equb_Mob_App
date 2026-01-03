import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { GlobalRole, User } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('reports')
export class ReportingController {
    constructor(private readonly reportingService: ReportingService) { }

    /**
     * [READ_ONLY]
     */
    @Get('admin/summary')
    @Roles(GlobalRole.ADMIN)
    async getAdminSummary() {
        return this.reportingService.getAdminGlobalSummary();
    }

    /**
     * [READ_ONLY]
     */
    @Get('equb/:id/metrics')
    @Roles(GlobalRole.ADMIN, GlobalRole.COLLECTOR)
    async getEqubMetrics(
        @CurrentUser() user: User,
        @Param('id') equbId: string
    ) {
        return this.reportingService.getEqubMetrics(user, equbId);
    }

    /**
     * [READ_ONLY]
     */
    @Get('member/dashboard')
    @Roles(GlobalRole.MEMBER, GlobalRole.ADMIN)
    async getMemberDashboard(@CurrentUser() user: User) {
        return this.reportingService.getMemberDashboard(user.id);
    }

    /**
     * [READ_ONLY]
     */
    @Get('collector/summary')
    @Roles(GlobalRole.COLLECTOR, GlobalRole.ADMIN)
    async getCollectorSummary(@CurrentUser() user: User) {
        return this.reportingService.getCollectorSummary(user.id);
    }

    /**
     * [READ_ONLY]
     */
    @Get('contributions')
    @Roles(GlobalRole.ADMIN, GlobalRole.COLLECTOR)
    async getContributionReport(
        @Query('equbId') equbId?: string,
        @Query('round') round?: string,
    ) {
        return this.reportingService.getContributionReport(
            equbId,
            round ? parseInt(round, 10) : undefined,
        );
    }

    /**
     * [READ_ONLY]
     */
    @Get('payouts')
    @Roles(GlobalRole.ADMIN, GlobalRole.COLLECTOR)
    async getPayoutReport(
        @Query('equbId') equbId?: string,
        @Query('round') round?: string,
    ) {
        return this.reportingService.getPayoutReport(
            equbId,
            round ? parseInt(round, 10) : undefined,
        );
    }

    /**
     * [READ_ONLY]
     * Phase 6: Exportable Ledger (JSON)
     */
    @Get('equbs/:id/ledger.json')
    @Roles(GlobalRole.ADMIN, GlobalRole.COLLECTOR)
    async getLedgerJson(@Param('id') equbId: string) {
        return this.reportingService.generateLedgerReport(equbId, 'json');
    }

    /**
     * [READ_ONLY]
     * Phase 6: Exportable Ledger (CSV)
     */
    @Get('equbs/:id/ledger.csv')
    @Roles(GlobalRole.ADMIN, GlobalRole.COLLECTOR)
    async getLedgerCsv(@Param('id') equbId: string) {
        return this.reportingService.generateLedgerReport(equbId, 'csv');
    }
}
