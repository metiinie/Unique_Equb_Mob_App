import { Controller, Post, Get, Param, Query, ParseUUIDPipe, ParseIntPipe, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { GlobalRole, User } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GetPayoutsQueryDto } from './dtos/get-payouts-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('equbs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayoutController {
    constructor(private readonly payoutService: PayoutService) { }

    /**
     * POST /equbs/:id/payouts/execute
     * 
     * Execute payout for current round
     * 
     * Access: ADMIN or COLLECTOR only
     * 
     * Response Codes:
     * - 201 Created: Payout executed successfully
     * - 400 Bad Request: Contributions incomplete or invalid state 
     * - 403 Forbidden: Unauthorized role
     * - 404 Not Found: Equb not found
     * - 409 Conflict: Payout already executed, Equb not ACTIVE, or no eligible members
     */
    @Post(':id/payouts/execute')
    @Roles(GlobalRole.ADMIN, GlobalRole.COLLECTOR)
    @HttpCode(HttpStatus.CREATED)
    async executePayout(
        @CurrentUser() user: User,
        @Param('id', ParseUUIDPipe) equbId: string,
    ) {
        return this.payoutService.executePayout(user, equbId);
    }

    @Get(':id/payouts')
    @Roles(GlobalRole.ADMIN, GlobalRole.COLLECTOR, GlobalRole.MEMBER)
    async getPayouts(
        @CurrentUser() user: User,
        @Param('id', ParseUUIDPipe) equbId: string,
        @Query() query: GetPayoutsQueryDto,
    ) {
        return this.payoutService.getPayouts(user, equbId, query.round);
    }

    @Get(':id/payouts/:round')
    @Roles(GlobalRole.ADMIN, GlobalRole.COLLECTOR)
    async getRoundPayout(
        @CurrentUser() user: User,
        @Param('id', ParseUUIDPipe) equbId: string,
        @Param('round', ParseIntPipe) round: number,
    ) {
        return this.payoutService.getRoundPayoutSummary(user, equbId, round);
    }

    /**
     * GET /equbs/:id/payouts/latest
     * 
     * Get the most recent payout for an Equb
     */
    @Get(':id/payouts/latest')
    @Roles(GlobalRole.ADMIN, GlobalRole.COLLECTOR, GlobalRole.MEMBER)
    async getLatestPayout(
        @CurrentUser() user: User,
        @Param('id', ParseUUIDPipe) equbId: string,
    ) {
        const payouts = await this.payoutService.getPayouts(user, equbId);
        return payouts.length > 0 ? payouts[payouts.length - 1] : null;
    }
}
