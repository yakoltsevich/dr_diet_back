import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserProfileService } from '../user-profile/user-profile.service';
import { PromptBuilder } from './prompt-builder';
import { OpenAiClient } from './openai.client';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { MenuDay } from './entities/menu-day.entity';
import { OpenaiService } from '../openai/openai.service';
import { DailyMenu } from './interfaces/daily-menu.interface';
import { buildDailyMenuPrompt } from './prompts/daily-menu.prompt';

@Injectable()
export class MenuService {
  constructor(
    private readonly profileService: UserProfileService,
    private readonly promptBuilder: PromptBuilder,
    private readonly openAiClient: OpenAiClient,
    private readonly openaiService: OpenaiService,
    @InjectRepository(Menu)
    private readonly menuRepo: Repository<Menu>,
    @InjectRepository(MenuDay)
    private readonly menuDayRepo: Repository<MenuDay>,
  ) {}

  async initMenuStructure(userId: number): Promise<MenuDay[]> {
    const profile = await this.profileService.getMyProfile(userId);
    const dishPlan = await this.generateDishPlan(profile);

    const menu = this.menuRepo.create({ user: { id: userId }, days: [] });
    await this.menuRepo.save(menu);

    const menuDays = dishPlan.map((dayData) =>
      this.menuDayRepo.create({
        day: dayData.day,
        breakfast: {
          dish: dayData.breakfast.dish,
          recipe: null,
          total: null,
        },
        lunch: {
          dish: dayData.lunch.dish,
          recipe: null,
          total: null,
        },
        dinner: {
          dish: dayData.dinner.dish,
          recipe: null,
          total: null,
        },
        total: null,
        menu,
      }),
    );

    await this.menuDayRepo.save(menuDays);
    return menuDays;
  }

  async enrichMenuWithNutrition(userId: number): Promise<{ menu: MenuDay[] }> {
    const profile = await this.profileService.getMyProfile(userId);
    const days = await this.getSavedMenu(userId);
    if (!days) throw new InternalServerErrorException('Меню не найдено');

    for (const day of days) {
      for (const meal of ['breakfast', 'lunch', 'dinner']) {
        const dishName = day[meal].dish;
        const total = await this.generateNutrientsForDish(dishName, profile);
        day[meal].total = total;
      }
      day.total = this.calculateDayTotal(day);
      await this.menuDayRepo.save(day);
    }

    return { menu: days };
  }

  async enrichMenuWithRecipes(userId: number): Promise<{ menu: MenuDay[] }> {
    const days = await this.getSavedMenu(userId);
    if (!days) throw new InternalServerErrorException('Меню не найдено');

    for (const day of days) {
      for (const meal of ['breakfast', 'lunch', 'dinner']) {
        const dishName = day[meal].dish;
        const recipe = await this.generateRecipeOnlyForDish(dishName);
        day[meal].recipe = recipe;
      }
      await this.menuDayRepo.save(day);
    }

    return { menu: days };
  }

  private async generateDishPlan(profile: any): Promise<any[]> {
    const prompt = this.promptBuilder.buildDishPlan(profile);

    const response = await this.openAiClient.chat(
      [
        {
          role: 'system',
          content: 'Ты диетолог. Ответ строго в формате JSON-массива из дней.',
        },
        { role: 'user', content: prompt },
      ],
      3000,
      'json_object',
    );

    const raw = response.choices[0]?.message?.content;
    if (!raw)
      throw new InternalServerErrorException(
        'Пустой ответ от OpenAI для плана блюд',
      );

    const cleaned = raw.replace(/```json|```/g, '').trim();
    try {
      const parsed = JSON.parse(cleaned);
      const keys = ['data', 'days', 'menu', 'week_menu'];
      if (Array.isArray(parsed)) return parsed;
      for (const key of keys) {
        if (Array.isArray(parsed[key])) return parsed[key];
      }
      if (parsed.day && parsed.breakfast && parsed.lunch && parsed.dinner)
        return [parsed];
      throw new Error('Формат JSON не содержит массив с днями');
    } catch (err) {
      console.error('❌ Ошибка парсинга плана блюд:', cleaned);
      throw new InternalServerErrorException(
        'Невалидный JSON при генерации плана блюд',
      );
    }
  }

  private async generateNutrientsForDish(
    dish: string,
    profile: any,
  ): Promise<{
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  }> {
    const prompt = this.promptBuilder.buildNutrientsPrompt(dish, profile);
    const response = await this.openAiClient.chat(
      [
        {
          role: 'system',
          content:
            'Ты нутрициолог. Ответ строго JSON с ключами: calories, protein, fat, carbs.',
        },
        { role: 'user', content: prompt },
      ],
      500,
      'json_object',
    );

    const raw = response.choices[0]?.message?.content;
    if (!raw)
      throw new InternalServerErrorException(
        `Пустой ответ нутриентов для "${dish}"`,
      );

    const cleaned = raw.replace(/```json|```/g, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (err) {
      console.error(`❌ Ошибка парсинга нутриентов для "${dish}":`, cleaned);
      throw new InternalServerErrorException(
        `Невалидный JSON нутриентов для "${dish}"`,
      );
    }
  }

  private async generateRecipeOnlyForDish(dish: string): Promise<{
    ingredients: { item: string; amount: string }[];
    steps: string[];
  }> {
    const prompt = this.promptBuilder.buildRecipeOnlyPrompt(dish);
    const response = await this.openAiClient.chat(
      [
        {
          role: 'system',
          content: 'Ты повар. Ответ строго JSON с recipe: ingredients и steps.',
        },
        { role: 'user', content: prompt },
      ],
      1000,
      'json_object',
    );

    const raw = response.choices[0]?.message?.content;
    if (!raw)
      throw new InternalServerErrorException(
        `Пустой ответ рецепта для "${dish}"`,
      );

    const cleaned = raw.replace(/```json|```/g, '').trim();
    try {
      const parsed = JSON.parse(cleaned);
      return parsed.recipe || parsed;
    } catch (err) {
      console.error(`❌ Ошибка парсинга рецепта для "${dish}":`, cleaned);
      throw new InternalServerErrorException(
        `Невалидный JSON рецепта для "${dish}"`,
      );
    }
  }

  private calculateDayTotal(day: { breakfast: any; lunch: any; dinner: any }) {
    return ['breakfast', 'lunch', 'dinner'].reduce(
      (acc, meal) => {
        const t = day[meal]?.total;
        return {
          calories: acc.calories + (t?.calories || 0),
          protein: acc.protein + (t?.protein || 0),
          fat: acc.fat + (t?.fat || 0),
          carbs: acc.carbs + (t?.carbs || 0),
        };
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0 },
    );
  }

  async generateMenuWithNutrition(userId: number): Promise<MenuDay[]> {
    const profile = await this.profileService.getMyProfile(userId);
    const prompt = this.promptBuilder.buildMenuWithNutritionPrompt(profile);

    const response = await this.openAiClient.chat(
      [
        {
          role: 'system',
          content:
            'Ты диетолог. Ответ строго в JSON: массив из 7 дней, каждый день с тремя приёмами пищи, с полями dish и total.',
        },
        { role: 'user', content: prompt },
      ],
      3000,
      'json_object',
    );

    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new InternalServerErrorException('Пустой ответ от OpenAI');

    const cleaned = raw.replace(/```json|```/g, '').trim();

    let days: any[] | undefined;
    try {
      const parsed = JSON.parse(cleaned);
      const keys = ['data', 'days', 'menu', 'week_menu', 'meal_plan'];

      if (Array.isArray(parsed)) {
        days = parsed;
      } else {
        for (const key of keys) {
          if (Array.isArray(parsed[key])) {
            days = parsed[key];
            break;
          }
        }

        if (
          !days &&
          parsed.day &&
          parsed.breakfast &&
          parsed.lunch &&
          parsed.dinner
        ) {
          days = [parsed];
        }
      }

      if (!days) throw new Error('Формат JSON не содержит массив с днями');
    } catch (err) {
      console.error('❌ Ошибка парсинга:', cleaned);
      throw new InternalServerErrorException('Невалидный JSON от OpenAI');
    }

    const menu = this.menuRepo.create({ user: { id: userId }, days: [] });
    await this.menuRepo.save(menu);

    const menuDays = days.map((dayData) =>
      this.menuDayRepo.create({
        day: dayData.day,
        breakfast: {
          dish: dayData.breakfast.dish,
          total: dayData.breakfast.total,
          recipe: null,
        },
        lunch: {
          dish: dayData.lunch.dish,
          total: dayData.lunch.total,
          recipe: null,
        },
        dinner: {
          dish: dayData.dinner.dish,
          total: dayData.dinner.total,
          recipe: null,
        },
        total: {
          calories:
            dayData.breakfast.total.calories +
            dayData.lunch.total.calories +
            dayData.dinner.total.calories,
          protein:
            dayData.breakfast.total.protein +
            dayData.lunch.total.protein +
            dayData.dinner.total.protein,
          fat:
            dayData.breakfast.total.fat +
            dayData.lunch.total.fat +
            dayData.dinner.total.fat,
          carbs:
            dayData.breakfast.total.carbs +
            dayData.lunch.total.carbs +
            dayData.dinner.total.carbs,
        },
        menu,
      }),
    );

    await this.menuDayRepo.save(menuDays);
    return menuDays;
  }

  async generateMenuForUser(userId: number): Promise<DailyMenu> {
    const profile = await this.profileService.getMyProfile(userId);
    const prompt = buildDailyMenuPrompt(profile); // работает с UserProfileEntity или DTO
    console.log('prompt', prompt);
    const raw = await this.openaiService.chat(prompt);
    const cleaned = raw
      .replace(/```json\s*([\s\S]*?)\s*```/, '$1') // если GPT оборачивает в блок
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch (e) {
      console.error('GPT ответ:', raw);
      throw new Error('Ошибка парсинга OpenAI-ответа');
    }
  }

  async getSavedMenu(userId: number): Promise<MenuDay[] | null> {
    const existingMenu = await this.menuRepo.findOne({
      where: { user: { id: userId } },
      relations: ['days'],
      order: {
        createdAt: 'DESC',
        days: {
          day: 'ASC',
        },
      },
    });

    return existingMenu?.days || null;
  }
}
