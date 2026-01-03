import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { GlobalRole, User } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get()
    async getUserNotifications(@CurrentUser() user: User) {
        return this.notificationService.getUserNotifications(user.id, user.role);
    }

    @Get('equb/:equbId')
    async getEqubNotifications(
        @Param('equbId') equbId: string,
        @CurrentUser() user: User,
    ) {
        return this.notificationService.getEqubNotifications(equbId, user.role);
    }

    @Get('contributions/pending')
    @Roles(GlobalRole.MEMBER)
    async getPendingContributions(@CurrentUser() user: User) {
        return this.notificationService.getPendingContributions(user.id);
    }

    @Get('payouts/received')
    @Roles(GlobalRole.MEMBER)
    async getReceivedPayouts(@CurrentUser() user: User) {
        return this.notificationService.getReceivedPayouts(user.id);
    }

    @Get('audit-alerts')
    @Roles(GlobalRole.ADMIN)
    async getAuditAlerts() {
        return this.notificationService.getAuditAlerts();
    }
}
