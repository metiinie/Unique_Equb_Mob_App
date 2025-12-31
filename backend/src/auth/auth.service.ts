import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../modules/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { SignupDto } from './dtos/signup.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) { }

    /**
     * Phase 1: Identity & Credentials Verification
     */
    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(pass, user.passwordHash);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Return user without password
        const { passwordHash, ...result } = user;
        return result;
    }

    async signup(signupDto: SignupDto) {
        const user = await this.userService.create({
            email: signupDto.email,
            password: signupDto.password,
            fullName: signupDto.fullName,
            role: 'MEMBER' as any, // Default role
        });

        const payload = { sub: user.id, email: user.email, role: user.role };
        const { passwordHash, ...safeUser } = user;
        return {
            access_token: this.jwtService.sign(payload),
            user: safeUser,
        };
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);

        // This will be expanded in Phase 2 for cookie handling
        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }
}
