import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class RejectContributionDto {
    @IsString()
    @IsNotEmpty({ message: 'Reason is required' })
    @MinLength(5, { message: 'Reason must be at least 5 characters long' })
    reason: string;
}
