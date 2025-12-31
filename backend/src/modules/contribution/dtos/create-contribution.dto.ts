import { IsNumber, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContributionDto {
    @IsNumber()
    @IsPositive({ message: 'Amount must be a positive number' })
    @Min(0.01, { message: 'Amount must be at least 0.01' })
    @Type(() => Number)
    amount: number;
}
