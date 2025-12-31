import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EqubStatus } from '@prisma/client';

@Injectable()
export class EqubRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string) {
        return this.prisma.equb.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { memberships: true }
                }
            }
        });
    }

    async findActiveByUserId(userId: string) {
        return this.prisma.equb.findMany({
            where: {
                memberships: {
                    some: { userId, status: 'ACTIVE' }
                },
                status: EqubStatus.ACTIVE
            }
        });
    }

    async getAdmin(equbId: string) {
        return this.prisma.membership.findFirst({
            where: { equbId, role: 'ADMIN' },
            include: { user: true }
        });
    }
}
