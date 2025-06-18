// src/ingredient/ingredient.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IngredientService } from './ingredient.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { AuthenticatedRequest } from '../user-settings/user-settings.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('ingredients')
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query('offset') offset = '0',
    @Query('limit') limit = '20',
    @Query('name') name: string,
  ) {
    const userId = req.user.id;
    return this.ingredientService.findAllPaginated({
      offset: parseInt(offset),
      limit: parseInt(limit),
      name,
      userId,
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateIngredientDto) {
    return this.ingredientService.updateOrThrow({ id: +id }, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ingredientService.removeOrThrow({ id: +id });
  }
}
