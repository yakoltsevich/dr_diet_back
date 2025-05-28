// src/ingredient/dto/create-ingredient.dto.ts
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CreatedBy } from '../entities/ingredient.entity';

export class CreateIngredientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  calories: number;

  @IsNumber()
  protein: number;

  @IsNumber()
  fat: number;

  @IsNumber()
  carbs: number;

  @IsEnum(CreatedBy)
  createdBy: CreatedBy;
}
