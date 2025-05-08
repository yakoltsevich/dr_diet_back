import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { UserProfileModule } from '../user-profile/user-profile.module';
import { MenuController } from './menu.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { MenuDay } from './entities/menu-day.entity';
import { User } from '../users/entities/user.entity';
import { OpenaiModule } from '../openai/openai.module';
import { MenuPromptBuilder } from './prompts/week-menu.prompt'; // добавить импорт

@Module({
  controllers: [MenuController],
  imports: [
    OpenaiModule,
    UserProfileModule,
    TypeOrmModule.forFeature([User, Menu, MenuDay]), // добавлен User
  ],
  providers: [MenuService, MenuPromptBuilder],
  exports: [MenuService],
})
export class MenuModule {}
