// src/ingredient/ingredient.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientService } from './ingredient.service';
import { Ingredient } from './entities/ingredient.entity';
import { OpenaiService } from '../openai/openai.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ingredient])],
  providers: [IngredientService, OpenaiService],
  exports: [IngredientService],
})
export class IngredientModule {}
