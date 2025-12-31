import { Module } from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { ContributionController } from './contribution.controller';
import { ContributionRepository } from './contribution.repository';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ContributionController],
    providers: [ContributionService, ContributionRepository],
    exports: [ContributionService, ContributionRepository],
})
export class ContributionModule { }
