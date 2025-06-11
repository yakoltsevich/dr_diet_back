// src/barcode/barcode.controller.ts
import { Controller, Get, Param, Req } from '@nestjs/common';
import { BarcodeService } from './barcode.service';
import { Request } from 'express';

@Controller('barcode')
export class BarcodeController {
  constructor(private readonly barcodeService: BarcodeService) {}

  @Get(':code')
  async getIngredientByBarcode(
    @Req() req: Request,
    @Param('code') code: string,
  ) {
    const userId = Number((req.user as any).id);
    const ingredient = await this.barcodeService.findOrFetchIngredient(
      code,
      userId,
    );
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
