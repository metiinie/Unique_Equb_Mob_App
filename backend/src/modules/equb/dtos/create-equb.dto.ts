import { IsString, IsInt, IsNumber, Min, IsPositive } from 'class-validator';

export class CreateEqubDto {
    @IsString()
    readonly name: string;

    @IsInt()
    @Min(2)
    readonly totalRounds: number;

    @IsNumber()
    @IsPositive()
    readonly contributionAmount: number;
}
