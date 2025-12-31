import { PartialType } from '@nestjs/mapped-types';
import { CreateEqubDto } from './create-equb.dto';

export class UpdateEqubDto extends PartialType(CreateEqubDto) { }
