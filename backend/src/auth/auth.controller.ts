import { Controller, Post, Body, Res, HttpCode, HttpStatus, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { SignupDto } from './dtos/signup.dto';
import { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    async signup(
        @Body() signupDto: SignupDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        console.log(`[AuthController] Signup attempt for: ${signupDto.email}`);
        const result = await this.authService.signup(signupDto);
        console.log(`[AuthController] Signup success for: ${signupDto.email}`);

        response.cookie('access_token', result.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Relaxed for local dev compatibility
            maxAge: 24 * 60 * 60 * 1000,
        });

        return {
            message: 'OK',
            // User identity is NOT returned here. Client must call /auth/me
        };
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        console.log(`[AuthController] Login attempt for: ${loginDto.email}`);
        const result = await this.authService.login(loginDto);
        console.log(`[AuthController] Login success for: ${loginDto.email}`);

        // Phase 2: Secure Cookie Implementation
        const isProd = process.env.NODE_ENV === 'production';
        response.cookie('access_token', result.access_token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'strict' : 'lax', // Strict in prod, Lax for dev
            maxAge: 24 * 60 * 60 * 1000,
        });

        return {
            message: 'OK',
            // User identity is NOT returned here. Client must call /auth/me
        };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Res({ passthrough: true }) response: Response) {
        response.clearCookie('access_token');
        return { message: 'Logged out successfully' };
    }

    @Get('me')
    async me(@CurrentUser() user: any) {
        return user;
    }
}
