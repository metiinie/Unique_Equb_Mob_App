import { IsNumber, IsPositive, Min, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContributionDto {
    @IsInt({ message: 'Round number must be an integer' })
    @Min(1, { message: 'Round number must be at least 1' })
    @Type(() => Number)
    roundNumber: number;

    @IsNumber()
    @IsPositive({ message: 'Amount must be a positive number' })
    @Min(0.01, { message: 'Amount must be at least 0.01' })
    @Type(() => Number)
    amount: number;
}
