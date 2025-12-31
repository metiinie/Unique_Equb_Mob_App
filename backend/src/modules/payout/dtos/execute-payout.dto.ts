import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ExecutePayoutDto {
    @IsOptional()
    @IsString()
    @IsUUID()
    recipientId?: string;
}
