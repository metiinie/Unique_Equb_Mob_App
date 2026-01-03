import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { GlobalRole, User } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateContributionDto } from './dtos/create-contribution.dto';
import { RejectContributionDto } from './dtos/reject-contribution.dto';
import { GetContributionsQueryDto } from './dtos/get-contributions-query.dto';
import { FinancialWrite } from '../../common/guards/system-safety.guard';

/**
 * Contribution Controller
 * 
 * Endpoints:
 * - POST /equbs/:id/contribute - Create contribution (MEMBER only)
 * - POST /contributions/:id/confirm - Confirm contribution (ADMIN/COLLECTOR)
 * - POST /contributions/:id/reject - Reject contribution (ADMIN/COLLECTOR)
 * - GET /equbs/:id/contributions - Get contributions for Equb (role-based filtering)
 * - GET /contributions/my - Get current user's contributions
 * - GET /equbs/:id/round-summary/:round - Get round summary (ADMIN/COLLECTOR)
 */
@Controller()
export class ContributionController {
    constructor(private readonly contributionService: ContributionService) { }

    /**
     * [FINANCIAL_WRITE]
     * POST /equbs/:id/contributions
     * 
     * Create a new contribution for a specific round (Phase 1)
     * 
     * Access: MEMBER only
     * 
     * Response Codes:
     * - 201: Contribution created successfully
     * - 400: Invalid amount or round number
     * - 403: Not a MEMBER or not an active member of the Equb
     * - 404: Equb not found
     * - 409: Duplicate contribution, invalid round, or payout exists
     */
    @Post('equbs/:id/contributions')
    @Roles(GlobalRole.MEMBER)
    @FinancialWrite()
    @HttpCode(HttpStatus.CREATED)
    async contribute(
        @CurrentUser() user: User,
        @Param('id') equbId: string,
        @Body() dto: CreateContributionDto,
    ) {
        return this.contributionService.createContribution(user, equbId, dto.roundNumber, dto.amount);
    }

    /**
     * [READ_ONLY]
     * GET /equbs/:id/my-contribution-status
     * Check if current user has contributed for current round
     */
    @Get('equbs/:id/my-contribution-status')
    @Roles(GlobalRole.MEMBER)
    async getMyContributionStatus(
        @CurrentUser() user: User,
        @Param('id') equbId: string,
    ) {
        return this.contributionService.getMyContributionStatus(user, equbId);
    }

    /**
     * [FINANCIAL_WRITE]
     * POST /contributions/:id/confirm
     * 
     * Confirm a pending contribution
     * 
     * Access: ADMIN or COLLECTOR (COLLECTOR must be assigned to the Equb)
     * 
     * Response Codes:
     * - 200: Contribution confirmed
     * - 400: Contribution not found
     * - 403: Insufficient permissions
     * - 409: Contribution is not in PENDING status
     */
    @Post('contributions/:id/confirm')
    @Roles(GlobalRole.ADMIN, GlobalRole.COLLECTOR)
    @FinancialWrite()
    @HttpCode(HttpStatus.OK)
    async confirmContribution(
        @CurrentUser() user: User,
        @Param('id') contributionId: string,
    ) {
        return this.contributionService.confirmContribution(user, contributionId);
    }

    /**
     * [FINANCIAL_WRITE]
     * POST /contributions/:id/reject
     * 
     * Reject a pending contribution with a reason
     * 
     * Access: ADMIN or COLLECTOR
     * 
     * Response Codes:
     * - 200: Contribution rejected
     * - 400: Contribution not found or invalid reason
     * - 403: Insufficient permissions
     * - 409: Contribution is not in PENDING status
     */
    @Post('contributions/:id/reject')
    @Roles(GlobalRole.ADMIN, GlobalRole.COLLECTOR)
    @FinancialWrite()
    @HttpCode(HttpStatus.OK)
    async rejectContribution(
        @CurrentUser() user: User,
        @Param('id') contributionId: string,
        @Body() dto: RejectContributionDto,
    ) {
        return this.contributionService.rejectContribution(user, contributionId, dto.reason);
    }

    /**
     * [READ_ONLY]
     * GET /equbs/:id/contributions?round=n
     * 
     * Get contributions for an Equb
     * 
     * Role-based filtering:
     * - ADMIN: Sees all contributions
     * - COLLECTOR: Sees all for assigned Equbs
     * - MEMBER: Sees only their own contributions
     * 
     * Query params:
     * - round (optional): Filter by round number
     * 
     * Response Codes:
     * - 200: Contributions retrieved
     * - 400: Equb not found
     * - 403: Insufficient permissions (COLLECTOR not assigned)
     */
    @Get('equbs/:id/contributions')
    async getContributions(
        @CurrentUser() user: User,
        @Param('id') equbId: string,
        @Query() query: GetContributionsQueryDto,
    ) {
        return this.contributionService.getContributions(user, equbId, query.round);
    }

    /**
     * [READ_ONLY]
     * GET /contributions/my
     * 
     * Get current user's contributions across all Equbs
     * 
     * Access: Authenticated users
     * 
     * Response Codes:
     * - 200: Contributions retrieved
     */
    @Get('contributions/my')
    async getMyContributions(@CurrentUser() user: User) {
        return this.contributionService.getMyContributions(user);
    }

    /**
     * [READ_ONLY]
     * GET /equbs/:id/round-summary/:round
     * 
     * Get detailed summary of contributions for a specific round
     * 
     * Access: ADMIN or COLLECTOR (COLLECTOR must be assigned)
     * 
     * Returns:
     * - Total members
     * - Confirmed/Pending/Rejected counts
     * - Total expected vs collected
     * - Collection rate percentage
     * - Full list of contributions
     * 
     * Response Codes:
     * - 200: Summary retrieved
     * - 400: Equb not found
     * - 403: Insufficient permissions
     */
    @Get('equbs/:id/round-summary/:round')
    @Roles(GlobalRole.ADMIN, GlobalRole.COLLECTOR)
    async getRoundSummary(
        @CurrentUser() user: User,
        @Param('id') equbId: string,
        @Param('round') roundNumber: string,
    ) {
        return this.contributionService.getRoundSummary(
            user,
            equbId,
            parseInt(roundNumber, 10),
        );
    }
}
