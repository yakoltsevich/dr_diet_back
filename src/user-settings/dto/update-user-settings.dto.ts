import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateUserSettingsDto {
  @IsOptional()
  @IsIn(['en', 'ru'])
  language?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ingredientSources?: string[];
}
