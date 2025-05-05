import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserProfileResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  birthDate: string;

  @ApiProperty()
  gender: string;

  @ApiProperty()
  height: number;

  @ApiProperty()
  weight: number;

  @ApiProperty()
  activityLevel: string;

  @ApiPropertyOptional({ type: [String] })
  allergies?: string[];

  @ApiPropertyOptional({ type: [String] })
  dietaryPreferences?: string[];

  @ApiPropertyOptional({ type: [String] })
  medicalConditions?: string[];

  @ApiPropertyOptional({ type: [String] })
  supplements?: string[];

  @ApiPropertyOptional({ type: [String] })
  favoriteFoods?: string[];

  @ApiPropertyOptional({ type: [String] })
  dislikedFoods?: string[];

  @ApiProperty()
  calories: number;

  @ApiProperty()
  fats: number;

  @ApiProperty()
  carbs: number;

  @ApiProperty()
  proteins: number;
}
