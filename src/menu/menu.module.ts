import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { UserProfileModule } from '../user-profile/user-profile.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UserProfileModule, ConfigModule],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
