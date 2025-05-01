import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class GenerateMenuDto {
  @ApiPropertyOptional({
    description:
      'Массив номеров дней недели (1–7), если нужно сгенерировать выборочно',
    type: [Number],
    example: [1, 3, 5],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(7, { each: true })
  days?: number[];
}
