// src/barcode/barcode.controller.ts
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { BarcodeService } from './barcode.service';
import { AuthenticatedRequest } from '../user-settings/user-settings.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('barcode')
export class BarcodeController {
  constructor(private readonly barcodeService: BarcodeService) {}

  @Get(':code')
  async getIngredientByBarcode(
    @Req() req: AuthenticatedRequest,
    @Param('code') code: string,
  ) {
    try {
      const userId = req.user?.id;
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
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}
