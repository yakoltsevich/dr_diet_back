import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateTokens(payload: { sub: number; email: string }) {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (error) {
      throw new UnauthorizedException('Невалидный refresh токен');
    }
  }
}
