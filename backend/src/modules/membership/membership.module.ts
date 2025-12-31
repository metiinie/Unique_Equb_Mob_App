import { Module, forwardRef } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { MembershipController } from './membership.controller';
import { MembershipRepository } from './membership.repository';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { EqubModule } from '../equb/equb.module';

@Module({
    imports: [PrismaModule, forwardRef(() => EqubModule)],
    controllers: [MembershipController],
    providers: [MembershipService, MembershipRepository],
    exports: [MembershipService, MembershipRepository],
})
export class MembershipModule { }
