import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Неверный email');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный пароль');
    }

    const payload = { sub: user.id, email: user.email, name: user.name };
    const { accessToken, refreshToken } =
      await this.authService.generateTokens(payload);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax', // в dev лучше lax
      path: '/', // ❗обязательно
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { access_token: accessToken };
  }

  @Post('refresh')
  async refresh(@Req() req: Request) {
    const token = req.cookies?.['refresh_token'];
    if (!token) {
      throw new UnauthorizedException('Отсутствует refresh token');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const newAccessToken = await this.jwtService.signAsync(
        { sub: payload.sub, email: payload.email, name: payload.name },
        { expiresIn: '15m' },
      );
      return { access_token: newAccessToken };
    } catch {
      throw new UnauthorizedException('Невалидный refresh token');
    }
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', { path: '/' });
    return { message: 'Вы успешно вышли из системы' };
  }
}
