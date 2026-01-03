import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { CreateMembershipDto } from './dtos/create-membership.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { GlobalRole, User, MembershipRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('memberships')
export class MembershipController {
    constructor(private readonly membershipService: MembershipService) { }


    @Post('equbs/:equbId/members')
    @Roles(GlobalRole.ADMIN, GlobalRole.COLLECTOR)
    async addMember(
        @CurrentUser() user: User,
        @Param('equbId') equbId: string,
        @Body() dto: Omit<CreateMembershipDto, 'equbId'>,
    ) {
        const fullDto: CreateMembershipDto = {
            equbId,
            userId: dto.userId,
        };
        return this.membershipService.addMember(user, fullDto);
    }

    @Get('equbs/:id')
    @Roles(GlobalRole.ADMIN, GlobalRole.MEMBER, GlobalRole.COLLECTOR)
    async getMembers(@Param('id') equbId: string) {
        return this.membershipService.getMembersByEqub(equbId);
    }

    /**
     * [FINANCIAL_WRITE] [ADMIN_OPERATION]
     * Phase 10: Membership Lifecycle Controls
     */
    @Post('equbs/:equbId/members/:userId/suspend')
    @Roles(GlobalRole.ADMIN, GlobalRole.COLLECTOR)
    async suspendMember(
        @CurrentUser() user: User,
        @Param('equbId') equbId: string,
        @Param('userId') userId: string,
    ) {
        return this.membershipService.suspendMember(user, equbId, userId);
    }

    @Post('equbs/:equbId/members/:userId/reinstate')
    @Roles(GlobalRole.ADMIN, GlobalRole.COLLECTOR)
    async reinstateMember(
        @CurrentUser() user: User,
        @Param('equbId') equbId: string,
        @Param('userId') userId: string,
    ) {
        return this.membershipService.reinstateMember(user, equbId, userId);
    }

    @Post('equbs/:equbId/members/:userId/delete')
    @Roles(GlobalRole.ADMIN, GlobalRole.COLLECTOR)
    async removeMember(
        @CurrentUser() user: User,
        @Param('equbId') equbId: string,
        @Param('userId') userId: string,
    ) {
        return this.membershipService.removeMember(user, equbId, userId);
    }

    @Post('equbs/:equbId/members/:userId/role')
    @Roles(GlobalRole.ADMIN)
    async changeMemberRole(
        @CurrentUser() user: User,
        @Param('equbId') equbId: string,
        @Param('userId') userId: string,
        @Body('role') role: MembershipRole,
    ) {
        return this.membershipService.changeMemberRole(user, equbId, userId, role);
    }
}
