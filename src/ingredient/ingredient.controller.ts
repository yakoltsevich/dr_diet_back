// src/ingredient/ingredient.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { IngredientService } from './ingredient.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Controller('ingredients')
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  @Get()
  findAll(
    @Query('offset') offset = '0',
    @Query('limit') limit = '20',
    @Query('name') name?: string,
  ) {
    return this.ingredientService.findAllPaginated({
      offset: parseInt(offset),
      limit: parseInt(limit),
      name,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ingredientService.findOneOrThrow({ id: +id });
  }

  @Post()
  create(@Body() createDto: CreateIngredientDto) {
    return this.ingredientService.create(createDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateIngredientDto) {
    return this.ingredientService.updateOrThrow({ id: +id }, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ingredientService.removeOrThrow({ id: +id });
  }
}
