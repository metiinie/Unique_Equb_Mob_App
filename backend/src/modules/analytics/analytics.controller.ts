import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { GlobalRole } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(GlobalRole.ADMIN, GlobalRole.COLLECTOR)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('equbs/summary')
    async getEqubSummary() {
        return this.analyticsService.getEqubAnalyticsSummary();
    }

    @Get('contributions/history')
    async getContributionHistory() {
        return this.analyticsService.getContributionHistory();
    }

    @Get('payouts/history')
    async getPayoutHistory() {
        return this.analyticsService.getPayoutHistory();
    }

    @Get('member/engagement')
    async getMemberEngagement() {
        return this.analyticsService.getMemberEngagement();
    }

    @Get('reports/export')
    async exportReports(@Query('type') type: 'contributions' | 'payouts' | 'summary' = 'summary') {
        return this.analyticsService.getExportData(type);
    }
}
