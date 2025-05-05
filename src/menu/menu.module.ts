import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { UserProfileModule } from '../user-profile/user-profile.module';
import { PromptBuilder } from './prompt-builder';
import { OpenAiClient } from './openai.client';
import { MenuParser } from './menu-parser';
import { MenuController } from './menu.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { MenuDay } from './entities/menu-day.entity';
import { User } from '../users/entities/user.entity';
import { OpenaiModule } from '../openai/openai.module'; // добавить импорт

@Module({
  controllers: [MenuController],
  imports: [
    OpenaiModule,
    UserProfileModule,
    TypeOrmModule.forFeature([User, Menu, MenuDay]), // добавлен User
  ],
  providers: [MenuService, PromptBuilder, OpenAiClient, MenuParser],
  exports: [MenuService],
})
export class MenuModule {}
