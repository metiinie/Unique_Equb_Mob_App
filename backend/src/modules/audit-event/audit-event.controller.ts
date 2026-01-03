import { Controller, Get, Query, Param } from '@nestjs/common';
import { AuditEventService } from './audit-event.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { GlobalRole, AuditActionType } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('audit-events')
export class AuditEventController {
    constructor(private readonly auditEventService: AuditEventService) { }

    @Get()
    @Roles(GlobalRole.ADMIN)
    async findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('actionType') actionType?: AuditActionType,
        @Query('actorUserId') actorUserId?: string,
        @Query('entityType') entityType?: string,
        @Query('entityId') entityId?: string,
    ) {
        return this.auditEventService.getLogs({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
            actionType,
            actorUserId,
            entityType,
            entityId,
        }, GlobalRole.ADMIN);
    }

    @Get('my')
    async getMyActivities(
        @CurrentUser() user: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.auditEventService.getMyActivities(
            user.id,
            user.role as GlobalRole,
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
        );
    }

    /**
     * [READ_ONLY]
     * Phase 8: Human-Readable Timeline
     */
    @Get('timeline/:equbId')
    @Roles(GlobalRole.ADMIN)
    async getTimeline(
        @Param('equbId') equbId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.auditEventService.getEqubTimeline(
            equbId,
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 50,
        );
    }
}
