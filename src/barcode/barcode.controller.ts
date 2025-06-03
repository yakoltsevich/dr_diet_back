// src/barcode/barcode.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { BarcodeService } from './barcode.service';

@Controller('barcode')
export class BarcodeController {
  constructor(private readonly barcodeService: BarcodeService) {}

  @Get(':code')
  async getIngredientByBarcode(@Param('code') code: string) {
    const ingredient = await this.barcodeService.findOrFetchIngredient(code);
    return {
      id: ingredient.id,
      name: ingredient.name,
      calories: ingredient.calories,
      protein: ingredient.protein,
      fat: ingredient.fat,
      carbs: ingredient.carbs,
    };
  }
}
