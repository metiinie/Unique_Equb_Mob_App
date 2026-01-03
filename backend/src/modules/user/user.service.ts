import { Injectable, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';

@Injectable()
export class UserService {
    constructor(private readonly userRepo: UserRepository) { }

    async findByEmail(email: string) {
        return this.userRepo.findByEmail(email);
    }

    async findById(id: string) {
        return this.userRepo.findById(id);
    }

    async findAll() {
        return this.userRepo.findAll();
    }

    async create(data: CreateUserDto) {
        const existing = await this.userRepo.findByEmail(data.email);
        if (existing) {
            throw new ConflictException('Email already in use');
        }

        const passwordHash = await bcrypt.hash(data.password, 10);

        return this.userRepo.create({
            email: data.email,
            fullName: data.fullName,
            passwordHash,
            role: data.role,
        });
    }

    async updateProfile(userId: string, data: UpdateProfileDto) {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (data.email && data.email !== user.email) {
            const existing = await this.userRepo.findByEmail(data.email);
            if (existing) {
                throw new ConflictException('Email already in use');
            }
        }

        return this.userRepo.update(userId, data);
    }

    async changePassword(userId: string, data: ChangePasswordDto) {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isMatch = await bcrypt.compare(data.currentPassword, user.passwordHash);
        if (!isMatch) {
            throw new ForbiddenException('Current password incorrect');
        }

        const passwordHash = await bcrypt.hash(data.newPassword, 10);
        return this.userRepo.update(userId, { passwordHash });
    }
}
