import { ApiProperty } from '@nestjs/swagger';

class NutritionInfo {
  @ApiProperty({ example: 400 })
  calories: number;

  @ApiProperty({ example: 30 })
  protein: number;

  @ApiProperty({ example: 15 })
  fat: number;

  @ApiProperty({ example: 20 })
  carbs: number;
}

class Meal {
  @ApiProperty({ example: 'Овсянка с ягодами' })
  dish: string;

  type: string;

  @ApiProperty()
  recipe: {
    ingredients: { item: string; amount: string }[];
    steps: string[];
  };

  @ApiProperty({ type: NutritionInfo })
  total: NutritionInfo;
}

export class DayMenuDto {
  @ApiProperty({
    example: 1,
    description: 'Номер дня недели: 1 — понедельник, 7 — воскресенье',
  })
  day: number;

  @ApiProperty({ type: Meal })
  breakfast: Meal;

  @ApiProperty({ type: Meal })
  lunch: Meal;

  @ApiProperty({ type: Meal })
  dinner: Meal;

  @ApiProperty({ type: NutritionInfo })
  total: NutritionInfo;
}

export class MenuResponseDto {
  @ApiProperty({ type: [DayMenuDto] })
  menu: DayMenuDto[];
}
