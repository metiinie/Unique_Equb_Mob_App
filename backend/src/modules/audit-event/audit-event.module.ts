import { Module, Global } from '@nestjs/common';
import { AuditEventService } from './audit-event.service';
import { AuditEventController } from './audit-event.controller';
import { AuditEventRepository } from './audit-event.repository';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Global()
@Module({
    imports: [PrismaModule],
    controllers: [AuditEventController],
    providers: [AuditEventService, AuditEventRepository],
    exports: [AuditEventService, AuditEventRepository],
})
export class AuditEventModule { }
