import { IsNumber, IsPositive } from 'class-validator';

export class RecordPaymentDto {
    @IsNumber()
    @IsPositive()
    amount: number;
}
