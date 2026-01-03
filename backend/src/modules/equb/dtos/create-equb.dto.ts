import { IsString, IsInt, IsNumber, Min, IsPositive, IsDateString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export enum PayoutOrderType {
    RANDOM = 'RANDOM',
    FIXED = 'FIXED',
}

export class CreateEqubDto {
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsNumber()
    @IsPositive()
    readonly contributionAmount: number;

    @IsInt()
    @Min(2, { message: 'Cycle length must be at least 2' })
    readonly cycleLength: number;

    @IsDateString()
    readonly startDate: string;

    @IsEnum(PayoutOrderType)
    readonly payoutOrderType: PayoutOrderType;

    @IsInt()
    @Min(2)
    readonly totalRounds: number;

    @IsString()
    @IsOptional()
    readonly idempotencyKey?: string;
}
