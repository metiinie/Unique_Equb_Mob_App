import { IsUUID, IsString } from 'class-validator';

export class CreateMembershipDto {
    @IsString()
    readonly equbId: string;

    @IsString()
    readonly userId: string;
}
