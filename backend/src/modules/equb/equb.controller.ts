import { Controller, Post, Body, Param, UseGuards, Get, Delete, ParseIntPipe, ParseUUIDPipe } from '@nestjs/common';
import { EqubService } from './equb.service';
import { MembershipService } from '../membership/membership.service';
import { CreateEqubDto } from './dtos/create-equb.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { User, GlobalRole } from '@prisma/client';

@Controller('equbs')
export class EqubController {
    constructor(
        private readonly equbService: EqubService,
        private readonly membershipService: MembershipService,
    ) { }

    /**
     * [ADMIN_OPERATION]
     */
    @Post()
    @Roles(GlobalRole.ADMIN)
    async create(
        @CurrentUser() user: User,
        @Body() dto: CreateEqubDto,
    ) {
        return this.equbService.createEqub(user, dto);
    }

    /**
     * [ADMIN_OPERATION]
     */
    @Post(':id/activate')
    @Roles(GlobalRole.ADMIN)
    async activate(
        @CurrentUser() user: User,
        @Param('id') equbId: string,
    ) {
        return this.equbService.activateEqub(user, equbId);
    }

    /**
     * [ADMIN_OPERATION]
     */
    @Post(':id/hold')
    @Roles(GlobalRole.ADMIN)
    async hold(
        @CurrentUser() user: User,
        @Param('id') equbId: string,
        @Body('reason') reason: string,
    ) {
        return this.equbService.holdEqub(user, equbId, reason);
    }

    /**
     * [ADMIN_OPERATION]
     */
    @Post(':id/resume')
    @Roles(GlobalRole.ADMIN)
    async resume(
        @CurrentUser() user: User,
        @Param('id') equbId: string,
    ) {
        return this.equbService.resumeEqub(user, equbId);
    }

    /**
     * [ADMIN_OPERATION]
     */
    @Post(':id/terminate')
    @Roles(GlobalRole.ADMIN)
    async terminate(
        @CurrentUser() user: User,
        @Param('id') equbId: string,
        @Body('reason') reason: string,
    ) {
        return this.equbService.terminateEqub(user, equbId, reason);
    }

    /**
     * [ADMIN_OPERATION]
     */
    @Post(':id/progress-round')
    @Roles(GlobalRole.ADMIN)
    async progressRound(
        @CurrentUser() user: User,
        @Param('id') equbId: string,
    ) {
        return this.equbService.progressRound(user, equbId);
    }

    /**
     * [READ_ONLY]
     */
    @Get('managed')
    @Roles(GlobalRole.ADMIN, GlobalRole.COLLECTOR)
    async getManaged(@CurrentUser() user: User) {
        return this.equbService.getManagedEqubs(user);
    }

    /**
     * [READ_ONLY]
     */
    @Get('managed/summary')
    @Roles(GlobalRole.ADMIN, GlobalRole.COLLECTOR)
    async getManagedSummary(@CurrentUser() user: User) {
        return this.equbService.getManagedSummary(user);
    }

    /**
     * [READ_ONLY]
     */
    @Get(':id')
    @Roles(GlobalRole.ADMIN, GlobalRole.MEMBER, GlobalRole.COLLECTOR)
    async getOne(@Param('id') id: string) {
        return this.equbService.getEqubById(id);
    }

    /**
     * [READ_ONLY]
     */
    @Get()
    @Roles(GlobalRole.ADMIN, GlobalRole.MEMBER, GlobalRole.COLLECTOR)
    async listEqubs(@CurrentUser() user: User) {
        return this.equbService.listEqubs(user);
    }

    /**
     * [READ_ONLY]
     */
    @Get(':id/members')
    @Roles(GlobalRole.ADMIN, GlobalRole.MEMBER, GlobalRole.COLLECTOR)
    async getMembers(@Param('id') equbId: string) {
        return this.membershipService.getMembersByEqub(equbId);
    }

    /**
     * [READ_ONLY]
     */
    @Get(':id/audit-trail')
    @Roles(GlobalRole.ADMIN)
    async getAuditTrail(@Param('id') equbId: string) {
        return this.equbService.getAuditTrail(equbId);
    }

    /**
     * [READ_ONLY]
     */
    @Get(':id/summary')
    @Roles(GlobalRole.ADMIN, GlobalRole.MEMBER, GlobalRole.COLLECTOR)
    async getEqubSummary(@CurrentUser() user: User, @Param('id') equbId: string) {
        return this.equbService.getEqubSummary(user, equbId);
    }

    /**
     * [READ_ONLY]
     */
    @Get(':id/rounds/current')
    @Roles(GlobalRole.ADMIN, GlobalRole.MEMBER, GlobalRole.COLLECTOR)
    async getCurrentRoundInfo(@Param('id') equbId: string) {
        return this.equbService.getCurrentRoundInfo(equbId);
    }

    /**
     * [ADMIN_OPERATION]
     */
    @Post(':id/members')
    @Roles(GlobalRole.ADMIN, GlobalRole.COLLECTOR)
    async inviteMember(
        @CurrentUser() user: User,
        @Param('id') equbId: string,
        @Body('userId') userId: string,
    ) {
        return this.membershipService.addMember(user, { equbId, userId });
    }

    /**
     * [ADMIN_OPERATION]
     */
    @Delete(':id/members/:userId')
    @Roles(GlobalRole.ADMIN, GlobalRole.COLLECTOR)
    async removeMember(
        @CurrentUser() user: User,
        @Param('id') equbId: string,
        @Param('userId') memberUserId: string,
    ) {
        return this.membershipService.removeMember(user, equbId, memberUserId);
    }

    /**
     * [ADMIN_OPERATION]
     */
    @Post(':id/advance-round')
    @Roles(GlobalRole.ADMIN, GlobalRole.COLLECTOR)
    async advanceRound(
        @CurrentUser() user: User,
        @Param('id') equbId: string,
    ) {
        return this.equbService.advanceRound(user, equbId);
    }

    /**
     * [ADMIN_OPERATION]
     */
    @Post(':id/complete')
    @Roles(GlobalRole.ADMIN, GlobalRole.COLLECTOR)
    async completeEqub(
        @CurrentUser() user: User,
        @Param('id', ParseUUIDPipe) equbId: string,
    ) {
        return this.equbService.completeEqub(user, equbId);
    }

    /**
     * Phase 5: Financial Ledger View
     */
    @Get(':id/rounds/:roundNumber/ledger')
    @Roles(GlobalRole.ADMIN, GlobalRole.MEMBER, GlobalRole.COLLECTOR)
    async getRoundLedger(
        @Param('id', ParseUUIDPipe) equbId: string,
        @Param('roundNumber', ParseIntPipe) roundNumber: number,
    ) {
        return this.equbService.getRoundLedger(equbId, roundNumber);
    }

    /**
     * Phase 5: Financial Summary View
     */
    @Get(':id/financial-summary')
    @Roles(GlobalRole.ADMIN, GlobalRole.MEMBER, GlobalRole.COLLECTOR)
    async getFinancialSummary(
        @Param('id', ParseUUIDPipe) equbId: string,
    ) {
        return this.equbService.getFinancialSummary(equbId);
    }

    /**
     * Phase 5: Status Flags for UI
     */
    @Get(':id/status-flags')
    @Roles(GlobalRole.ADMIN, GlobalRole.MEMBER, GlobalRole.COLLECTOR)
    async getStatusFlags(
        @Param('id', ParseUUIDPipe) equbId: string,
    ) {
        return this.equbService.getStatusFlags(equbId);
    }

    /**
     * Phase 5: Full Round Ledger View
     */
    @Get(':id/round-ledger')
    @Roles(GlobalRole.ADMIN, GlobalRole.MEMBER, GlobalRole.COLLECTOR)
    async getFullLedger(
        @Param('id', ParseUUIDPipe) equbId: string,
    ) {
        return this.equbService.getFullLedger(equbId);
    }
}
