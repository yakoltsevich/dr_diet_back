// src/ingredient/ingredient.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientService } from './ingredient.service';
import { Ingredient } from './entities/ingredient.entity';
import { OpenaiService } from '../openai/openai.service';
import { IngredientController } from './ingredient.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ingredient])],
  controllers: [IngredientController],
  providers: [IngredientService, OpenaiService],
  exports: [IngredientService],
})
export class IngredientModule {}
