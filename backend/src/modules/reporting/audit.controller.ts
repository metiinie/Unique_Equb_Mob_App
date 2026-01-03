import { Controller, Get, Query } from '@nestjs/common';
import { AuditEventService } from '../audit-event/audit-event.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { GlobalRole, AuditActionType } from '@prisma/client';

@Controller('audits')
export class AuditController {
    constructor(private readonly auditService: AuditEventService) { }

    /**
     * [READ_ONLY] [ADMIN_OPERATION]
     */
    @Get()
    @Roles(GlobalRole.ADMIN)
    async getAudits(
        @Query('equbId') equbId?: string,
        @Query('action') action?: string,
        @Query('roundNumber') roundNumber?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.auditService.getLogs({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 50,
            actionType: action as AuditActionType,
            entityId: equbId,
            entityType: equbId ? 'Equb' : undefined,
        });
    }
}
