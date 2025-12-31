import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UserService } from '../modules/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    return request?.cookies?.['access_token'];
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'dev_secret_key_change_in_prod',
        });
    }

    async validate(payload: any) {
        // payload: { sub, email, role }
        const user = await this.userService.findById(payload.sub);
        if (!user) {
            throw new UnauthorizedException();
        }
        const { passwordHash, ...safeUser } = user;
        return safeUser; // This is attached to request.user
    }
}
