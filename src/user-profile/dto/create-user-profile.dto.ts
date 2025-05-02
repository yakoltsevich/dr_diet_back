import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

export enum ActivityLevel {
  Sedentary = 'sedentary',
  Light = 'light',
  Moderate = 'moderate',
  Active = 'active',
  VeryActive = 'very_active',
}

export class CreateUserProfileDto {
  @ApiProperty()
  @IsDateString()
  @IsOptional()
  birthDate: string;

  @ApiProperty({ enum: Gender })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty()
  @IsNumber()
  height: number;

  @ApiProperty()
  @IsNumber()
  weight: number;

  @ApiProperty({ enum: ActivityLevel })
  @IsEnum(ActivityLevel)
  activityLevel: ActivityLevel;

  @ApiProperty()
  @IsString()
  goal: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  targetWeight?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  allergies?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  dietaryPreferences?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  medicalConditions?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  supplements?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  favoriteFoods?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  dislikedFoods?: string[];

  @ApiProperty()
  @IsNumber()
  calories: number;

  @ApiProperty()
  @IsNumber()
  fats: number;

  @ApiProperty()
  @IsNumber()
  carbs: number;

  @ApiProperty()
  @IsNumber()
  proteins: number;
}
