import { Module } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { PayoutController } from './payout.controller';
import { PayoutRepository } from './payout.repository';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PayoutController],
    providers: [PayoutService, PayoutRepository],
    exports: [PayoutService, PayoutRepository],
})
export class PayoutModule { }
