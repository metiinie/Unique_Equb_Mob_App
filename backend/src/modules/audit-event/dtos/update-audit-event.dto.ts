import { PartialType } from '@nestjs/mapped-types';
import { CreateAuditEventDto } from './create-audit-event.dto';

export class UpdateAuditEventDto extends PartialType(CreateAuditEventDto) { }
