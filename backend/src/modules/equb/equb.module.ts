import { Module, forwardRef } from '@nestjs/common';
import { EqubService } from './equb.service';
import { EqubController } from './equb.controller';
import { EqubRepository } from './equb.repository';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { MembershipModule } from '../membership/membership.module';

@Module({
    imports: [PrismaModule, forwardRef(() => MembershipModule)],
    controllers: [EqubController],
    providers: [EqubService, EqubRepository],
    exports: [EqubService, EqubRepository],
})
export class EqubModule { }
