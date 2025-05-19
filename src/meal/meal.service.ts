// src/meal/meal.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Meal } from './entities/meal.entity';
import { MealIngredient } from './entities/meal-ingredient.entity';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Ingredient } from '../ingredient/entities/ingredient.entity';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';

@Injectable()
export class MealService {
  constructor(
    @InjectRepository(Meal)
    private readonly mealRepo: Repository<Meal>,
    @InjectRepository(MealIngredient)
    private readonly mealIngredientRepo: Repository<MealIngredient>,
    @InjectRepository(Ingredient)
    private readonly ingredientRepo: Repository<Ingredient>,
  ) {}

  async findAll(filters?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Meal[]> {
    const where: any = {};

    if (filters?.dateFrom && filters?.dateTo) {
      where.date = Between(
        new Date(filters.dateFrom),
        new Date(filters.dateTo),
      );
    } else if (filters?.dateFrom) {
      where.date = MoreThanOrEqual(new Date(filters.dateFrom));
    } else if (filters?.dateTo) {
      where.date = LessThanOrEqual(new Date(filters.dateTo));
    }

    return this.mealRepo.find({
      where,
      relations: ['ingredients', 'ingredients.ingredient'],
      order: { date: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Meal> {
    const meal = await this.mealRepo.findOne({
      where: { id },
      relations: ['ingredients'],
    });
    if (!meal) throw new NotFoundException('Meal not found');
    return meal;
  }

  async create(dto: CreateMealDto): Promise<Meal> {
    const meal = this.mealRepo.create({
      name: dto.name,
      type: dto.type,
      date: dto.date,
    });

    const savedMeal = await this.mealRepo.save(meal);

    const ingredients = await Promise.all(
      dto.ingredients.map(async (item) => {
        const ingredient = await this.ingredientRepo.findOneByOrFail({
          id: item.ingredientId,
        });
        const mealIngredient = this.mealIngredientRepo.create({
          weight: item.weight,
          ingredient,
          meal: savedMeal,
        });
        return this.mealIngredientRepo.save(mealIngredient);
      }),
    );

    savedMeal.ingredients = ingredients;
    return savedMeal;
  }

  async update(id: number, dto: UpdateMealDto): Promise<Meal> {
    const meal = await this.findOne(id);

    meal.name = dto.name ?? meal.name;
    meal.type = dto.type ?? meal.type;
    meal.date = dto.date ?? meal.date;

    if (dto.ingredients) {
      await this.mealIngredientRepo.delete({ meal: { id } });

      const ingredients = await Promise.all(
        dto.ingredients.map(async (item) => {
          const ingredient = await this.ingredientRepo.findOneByOrFail({
            id: item.ingredientId,
          });
          const mealIngredient = this.mealIngredientRepo.create({
            weight: item.weight,
            ingredient,
            meal,
          });
          return this.mealIngredientRepo.save(mealIngredient);
        }),
      );

      meal.ingredients = ingredients;
    }

    return this.mealRepo.save(meal);
  }

  async remove(id: number): Promise<void> {
    await this.mealRepo.delete(id);
  }
}
