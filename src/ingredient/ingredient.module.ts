// src/ingredient/ingredient.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientService } from './ingredient.service';
import { Ingredient } from './entities/ingredient.entity';
import { OpenaiService } from '../openai/openai.service';
import { IngredientController } from './ingredient.controller';
import { FdcModule } from '../fdc/fdc.module';
import { UserSettingsModule } from '../user-settings/user-settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ingredient]),
    FdcModule,
    UserSettingsModule,
  ],
  controllers: [IngredientController],
  providers: [IngredientService, OpenaiService],
  exports: [IngredientService],
})
export class IngredientModule {}
