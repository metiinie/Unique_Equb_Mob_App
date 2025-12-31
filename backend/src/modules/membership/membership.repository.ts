import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class MembershipRepository {
    constructor(private readonly prisma: PrismaService) { }

    async find(equbId: string, userId: string) {
        return this.prisma.membership.findUnique({
            where: {
                equbId_userId: { equbId, userId },
            },
            include: { user: true },
        });
    }

    async findByEqub(equbId: string) {
        return this.prisma.membership.findMany({
            where: { equbId },
            include: { user: true },
        });
    }
}
