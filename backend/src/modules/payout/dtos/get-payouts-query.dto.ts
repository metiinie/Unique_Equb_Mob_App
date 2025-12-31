import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPayoutsQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    round?: number;
}
