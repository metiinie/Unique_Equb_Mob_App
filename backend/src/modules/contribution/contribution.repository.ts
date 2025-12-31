import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma, ContributionStatus } from '@prisma/client';

@Injectable()
export class ContributionRepository {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Find a specific contribution by unique constraint
     */
    async findByMemberAndRound(equbId: string, memberId: string, roundNumber: number) {
        return this.prisma.contribution.findUnique({
            where: {
                equbId_memberId_roundNumber: {
                    equbId,
                    memberId,
                    roundNumber,
                },
            },
            include: {
                equb: true,
                member: true,
            },
        });
    }

    /**
     * Create a new contribution (append-only)
     */
    async create(data: Prisma.ContributionCreateInput) {
        return this.prisma.contribution.create({
            data,
            include: {
                equb: true,
                member: true,
            },
        });
    }

    /**
     * Update contribution status (CONFIRMED or REJECTED)
     */
    async updateStatus(id: string, status: ContributionStatus) {
        return this.prisma.contribution.update({
            where: { id },
            data: { status },
        });
    }

    /**
     * Find all contributions for an Equb (with optional round filter)
     */
    async findByEqub(equbId: string, roundNumber?: number) {
        return this.prisma.contribution.findMany({
            where: {
                equbId,
                ...(roundNumber && { roundNumber }),
            },
            include: {
                member: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                        role: true,
                    },
                },
            },
            orderBy: [
                { roundNumber: 'desc' },
                { createdAt: 'desc' },
            ],
        });
    }

    /**
     * Find all contributions for a specific member
     */
    async findByMember(memberId: string, equbId?: string) {
        return this.prisma.contribution.findMany({
            where: {
                memberId,
                ...(equbId && { equbId }),
            },
            include: {
                equb: {
                    select: {
                        id: true,
                        name: true,
                        amount: true,
                        currentRound: true,
                        status: true,
                    },
                },
            },
            orderBy: [
                { createdAt: 'desc' },
            ],
        });
    }

    /**
     * Get total confirmed contributions for a round (sum of amounts)
     */
    async getRoundTotal(equbId: string, roundNumber: number) {
        const result = await this.prisma.contribution.aggregate({
            where: {
                equbId,
                roundNumber,
                status: ContributionStatus.CONFIRMED,
            },
            _sum: {
                amount: true,
            },
        });
        return result._sum.amount || 0;
    }

    /**
     * Count confirmed contributions for a round
     */
    async countConfirmedContributions(equbId: string, roundNumber: number) {
        return this.prisma.contribution.count({
            where: {
                equbId,
                roundNumber,
                status: ContributionStatus.CONFIRMED,
            },
        });
    }
}
