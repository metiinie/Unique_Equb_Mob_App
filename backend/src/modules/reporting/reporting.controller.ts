import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { GlobalRole, User } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('reports')
export class ReportingController {
    constructor(private readonly reportingService: ReportingService) { }

    @Get('admin/summary')
    @Roles(GlobalRole.ADMIN)
    async getAdminSummary() {
        return this.reportingService.getAdminGlobalSummary();
    }

    @Get('equb/:id/metrics')
    @Roles(GlobalRole.ADMIN, GlobalRole.COLLECTOR)
    async getEqubMetrics(
        @CurrentUser() user: User,
        @Param('id') equbId: string
    ) {
        return this.reportingService.getEqubMetrics(user, equbId);
    }

    @Get('member/dashboard')
    @Roles(GlobalRole.MEMBER, GlobalRole.ADMIN)
    async getMemberDashboard(@CurrentUser() user: User) {
        return this.reportingService.getMemberDashboard(user.id);
    }
}
