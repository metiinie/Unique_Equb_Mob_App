import { Injectable, ConflictException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dtos/create-user.dto';

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
}
