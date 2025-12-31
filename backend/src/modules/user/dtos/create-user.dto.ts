import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { GlobalRole } from '@prisma/client';

export class CreateUserDto {
    @IsEmail()
    readonly email: string;

    @IsString()
    @MinLength(3)
    readonly fullName: string;

    @IsString()
    @MinLength(8)
    readonly password: string;

    @IsOptional()
    @IsEnum(GlobalRole)
    readonly role?: GlobalRole;
}
