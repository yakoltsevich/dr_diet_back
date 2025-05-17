// src/meal/dto/create-meal.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  ValidateNested,
  IsArray,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MealType } from '../enums/meal-type.enum';

class MealIngredientInput {
  @IsNumber()
  ingredientId: number;

  @IsNumber()
  weight: number;
}

export class CreateMealDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(MealType)
  type: MealType;

  @IsDateString()
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MealIngredientInput)
  ingredients: MealIngredientInput[];
}
