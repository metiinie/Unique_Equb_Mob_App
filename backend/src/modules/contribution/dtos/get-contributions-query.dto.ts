import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetContributionsQueryDto {
    @IsOptional()
    @IsInt({ message: 'Round number must be an integer' })
    @Min(1, { message: 'Round number must be at least 1' })
    @Type(() => Number)
    round?: number;
}
