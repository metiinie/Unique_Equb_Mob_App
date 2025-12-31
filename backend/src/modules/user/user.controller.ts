import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { GlobalRole } from '@prisma/client';
import { CreateUserDto } from './dtos/create-user.dto';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

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
