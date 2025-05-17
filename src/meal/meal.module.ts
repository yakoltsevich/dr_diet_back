// src/meal/meal.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meal } from './entities/meal.entity';
import { MealIngredient } from './entities/meal-ingredient.entity';
import { MealService } from './meal.service';
import { MealController } from './meal.controller';
import { Ingredient } from '../ingredient/entities/ingredient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Meal, MealIngredient, Ingredient])],
  providers: [MealService],
  controllers: [MealController],
  exports: [MealService],
})
export class MealModule {}
