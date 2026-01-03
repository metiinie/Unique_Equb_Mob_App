import { Controller, Get, Post, Body, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { GlobalRole } from '@prisma/client';
import { CreateUserDto } from './dtos/create-user.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('me')
    async getProfile(@CurrentUser() user: any) {
        // Return full user from DB to get latest fields
        const fullUser = await this.userService.findById(user.id);
        const { passwordHash, ...result } = fullUser as any;
        return result;
    }

    @Patch('me')
    async updateProfile(
        @CurrentUser() user: any,
        @Body() dto: UpdateProfileDto
    ) {
        return this.userService.updateProfile(user.id, dto);
    }

    @Post('me/change-password')
    async changePassword(
        @CurrentUser() user: any,
        @Body() dto: ChangePasswordDto
    ) {
        return this.userService.changePassword(user.id, dto);
    }

    @Get()
    @Roles(GlobalRole.ADMIN)
    async findAll() {
        return this.userService.findAll();
    }

    @Post()
    @Roles(GlobalRole.ADMIN)
    async create(@Body() dto: CreateUserDto) {
        return this.userService.create(dto);
    }
}
