import { PartialType } from '@nestjs/mapped-types';
import {
  ActivityLevel,
  CreateUserProfileDto,
  Gender,
} from './create-user-profile.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateUserProfileDto extends PartialType(CreateUserProfileDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ enum: ActivityLevel })
  @IsOptional()
  @IsEnum(ActivityLevel)
  activityLevel?: ActivityLevel;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  allergies?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  dietaryPreferences?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  medicalConditions?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  supplements?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  favoriteFoods?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  dislikedFoods?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  calories?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  fats?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  carbs?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  proteins?: number;
}
