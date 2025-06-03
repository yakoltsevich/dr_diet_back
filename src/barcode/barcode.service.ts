import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import fetch from 'node-fetch';
import { Ingredient } from '../ingredient/entities/ingredient.entity';

@Injectable()
export class BarcodeService {
  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepo: Repository<Ingredient>,
  ) {}

  async findOrFetchIngredient(barcode: string): Promise<Partial<Ingredient>> {
    // 1. Поиск в БД
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

    // 2. Запрос в Open Food Facts
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    const response = await fetch(url);
    const json = await response.json();

    if (json.status !== 1 || !json.product) {
      throw new NotFoundException('Продукт не найден');
    }

    const product = json.product;
    const name = product.product_name || product.generic_name || 'Без названия';
    const nutriments = product.nutriments;

    return {
      name: name.trim(),
      barcode,
      calories: Math.round(nutriments['energy-kcal_100g'] || 0),
      protein: Math.round(nutriments['proteins_100g'] || 0),
      fat: Math.round(nutriments['fat_100g'] || 0),
      carbs: Math.round(nutriments['carbohydrates_100g'] || 0),
    };
  }
}
