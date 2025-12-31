import { Controller, Post, Body, Param, UseGuards, Get } from '@nestjs/common';
import { EqubService } from './equb.service';
import { CreateEqubDto } from './dtos/create-equb.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { User, GlobalRole } from '@prisma/client';

@Controller('equbs')
export class EqubController {
    constructor(private readonly equbService: EqubService) { }

    @Post()
    @Roles(GlobalRole.ADMIN)
    async create(
        @CurrentUser() user: User,
        @Body() dto: CreateEqubDto,
    ) {
        return this.equbService.createEqub(user, dto);
    }

    @Post(':id/activate')
    @Roles(GlobalRole.ADMIN)
    async activate(
        @CurrentUser() user: User,
        @Param('id') equbId: string,
    ) {
        return this.equbService.activateEqub(user, equbId);
    }

    @Post(':id/hold')
    @Roles(GlobalRole.ADMIN)
    async hold(
        @CurrentUser() user: User,
        @Param('id') equbId: string,
        @Body('reason') reason: string,
    ) {
        return this.equbService.holdEqub(user, equbId, reason);
    }

    @Post(':id/resume')
    @Roles(GlobalRole.ADMIN)
    async resume(
        @CurrentUser() user: User,
        @Param('id') equbId: string,
    ) {
        return this.equbService.resumeEqub(user, equbId);
    }

    @Post(':id/terminate')
    @Roles(GlobalRole.ADMIN)
    async terminate(
        @CurrentUser() user: User,
        @Param('id') equbId: string,
        @Body('reason') reason: string,
    ) {
        return this.equbService.terminateEqub(user, equbId, reason);
    }

    @Post(':id/progress-round')
    @Roles(GlobalRole.ADMIN)
    async progressRound(
        @CurrentUser() user: User,
        @Param('id') equbId: string,
    ) {
        return this.equbService.progressRound(user, equbId);
    }
}
