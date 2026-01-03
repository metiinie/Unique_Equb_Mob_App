import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UserRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async findAll() {
        return this.prisma.user.findMany();
    }

    async create(data: { email: string; fullName: string; passwordHash: string; role?: any }) {
        return this.prisma.user.create({
            data,
        });
    }

    async update(id: string, data: any) {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }
}
