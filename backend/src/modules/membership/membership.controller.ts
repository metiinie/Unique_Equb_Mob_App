import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { CreateMembershipDto } from './dtos/create-membership.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { GlobalRole, User } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('memberships')
export class MembershipController {
    constructor(private readonly membershipService: MembershipService) { }

    @Post()
    @Roles(GlobalRole.ADMIN, GlobalRole.MEMBER)
    async addMember(
        @CurrentUser() user: User,
        @Body() dto: CreateMembershipDto,
    ) {
        return this.membershipService.addMember(user, dto);
    }

    @Get('equbs/:id')
    @Roles(GlobalRole.ADMIN, GlobalRole.MEMBER, GlobalRole.COLLECTOR)
    async getMembers(@Param('id') equbId: string) {
        return this.membershipService.getMembersByEqub(equbId);
    }
}
