import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from '../auth/google.strategy';
import { AuthController } from '../controllers/authController';

@Module({
  imports: [PassportModule],
  providers: [GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
