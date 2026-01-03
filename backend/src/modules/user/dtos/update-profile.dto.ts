import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    fullName?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    language?: string;

    @IsOptional()
    notificationPreferences?: any;
}
