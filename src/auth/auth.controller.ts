import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
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
  async login(@Body() loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Неверный email');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    console.log('loginDto.password', loginDto.password);
    console.log('user.password', user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный  пароль');
    }

    const payload = { sub: user.id, email: user.email };
    const access_token = await this.jwtService.signAsync(payload);

    return { access_token };
  }
  // @Post('register')
  // async register(@Body() registerDto: RegisterDto) {
  //   try {
  //     const existingUser = await this.usersService.findByEmail(
  //       registerDto.email,
  //     );
  //     if (existingUser) {
  //       throw new UnauthorizedException('Email уже используется');
  //     }
  //
  //     const hashedPassword = await bcrypt.hash(registerDto.password, 10);
  //
  //     const user = await this.usersService.create({
  //       email: registerDto.email,
  //       password: hashedPassword,
  //     });
  //
  //     const payload = { sub: user.id, email: user.email };
  //     const access_token = await this.jwtService.signAsync(payload);
  //
  //     return { access_token };
  //   } catch (err) {
  //     console.error('Ошибка при регистрации:', err);
  //     throw err; // пробрасываем дальше
  //   }
  // }
  @Post('logout')
  async logout() {
    return { message: 'Вы успешно вышли из системы' };
  }
}
