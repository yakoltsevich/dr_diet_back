import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import fetch from 'node-fetch';
import { Ingredient } from '../ingredient/entities/ingredient.entity';
import { UserSettingsService } from '../user-settings/user-settings.service';

interface OpenFoodFactsProduct {
  product_name?: string;
  generic_name?: string;
  nutriments: {
    ['energy-kcal_100g']?: number;
    ['proteins_100g']?: number;
    ['fat_100g']?: number;
    ['carbohydrates_100g']?: number;
  };
}

interface OpenFoodFactsResponse {
  status: number;
  product?: OpenFoodFactsProduct;
}

@Injectable()
export class BarcodeService {
  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepo: Repository<Ingredient>,
    private readonly userSettingsService: UserSettingsService,
  ) {}

  async findOrFetchIngredient(
    barcode: string,
    userId: number,
  ): Promise<Partial<Ingredient>> {
    // 1. Получаем язык пользователя
    const settings = await this.userSettingsService.getByUser(userId);
    const language = settings.language || 'en';

    // 2. Ищем в БД
    const existing = await this.ingredientRepo.findOne({ where: { barcode } });
    if (existing) {
      return {
        id: existing.id,
        name: existing.name,
        barcode: existing.barcode,
        calories: existing.calories,
        protein: existing.protein,
        fat: existing.fat,
        carbs: existing.carbs,
      };
    }

    // 3. Запрос в Open Food Facts c языком
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json?lc=${language}`;
    const response = await fetch(url);
    const json = (await response.json()) as OpenFoodFactsResponse;

    if (json.status !== 1 || !json.product) {
      throw new NotFoundException('Продукт не найден');
    }

    const product = json.product;
    const name = product.product_name || product.generic_name || 'Без названия';
    const nutriments = product.nutriments;

    const round1 = (v: number | undefined) => Math.round((v || 0) * 10) / 10;

    return {
      name: name.trim(),
      barcode,
      calories: round1(nutriments['energy-kcal_100g']),
      protein: round1(nutriments['proteins_100g']),
      fat: round1(nutriments['fat_100g']),
      carbs: round1(nutriments['carbohydrates_100g']),
    };
  }
}
