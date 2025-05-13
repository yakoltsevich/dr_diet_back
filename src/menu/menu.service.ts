import { Injectable } from '@nestjs/common';
import { UserProfileService } from '../user-profile/user-profile.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { MenuDay } from './entities/menu-day.entity';
import { OpenaiService } from '../openai/openai.service';
import { DailyMenu, Ingredient } from './interfaces/daily-menu.interface';
import { MenuPromptBuilder } from './prompts/week-menu.prompt';
import { transformMenuToCleanDays } from './utils/transformMenu.util';
import { IngredientService } from '../ingredient/ingredient.service';
import { mealCalorieDistribution } from './constants/meal-targets';
import { scaleRecipeByTargetCalories } from './utils/scale-recipe.util';

@Injectable()
export class MenuService {
  constructor(
    private readonly profileService: UserProfileService,
    private readonly menuPromptBuilder: MenuPromptBuilder,
    private readonly openaiService: OpenaiService,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(MenuDay)
    private readonly menuDayRepository: Repository<MenuDay>,
    private readonly ingredientService: IngredientService,
  ) {}

  async generateWeeklyMenuForUser(userId: number): Promise<DailyMenu[]> {
    const profile = await this.profileService.getMyProfile(userId);
    const prompt = this.menuPromptBuilder.buildFullWeekMenuPrompt(profile);
    const raw = await this.openaiService.chat(prompt);
    const cleaned = raw.replace(/```json\s*([\s\S]*?)\s*```/, '$1').trim();

    let parsed: DailyMenu[];
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error('GPT ответ (неделя):\n', raw);
      throw new Error('Ошибка парсинга недельного меню');
    }

    const menu = this.menuRepository.create({ user: { id: userId } as any });
    await this.menuRepository.save(menu);

    const menuDays = parsed.map((dayMenu) =>
      this.menuDayRepository.create({
        menu,
        day: dayMenu.day,
        meals: dayMenu.meals,
      }),
    );

    await this.menuDayRepository.save(menuDays);
    menu.days = menuDays;

    return transformMenuToCleanDays(menu);
  }

  async fillRecipesForMenu(userId: number): Promise<DailyMenu[]> {
    // Получаем последнее меню
    let menu = await this.menuRepository.findOne({
      where: { user: { id: userId } },
      relations: ['days'],
      order: {
        createdAt: 'DESC',
        days: { day: 'ASC' },
      },
    });

    if (!menu) {
      await this.generateWeeklyMenuForUser(userId);
      menu = await this.menuRepository.findOne({
        where: { user: { id: userId } },
        relations: ['days'],
        order: {
          createdAt: 'DESC',
          days: { day: 'ASC' },
        },
      });
      if (!menu) throw new Error('Не удалось создать меню');
    }

    // Проходим по каждому блюду и дозаполняем рецепты
    for (const day of menu.days) {
      let isUpdated = false;

      for (const meal of day.meals) {
        if (meal.recipe && meal.recipe.ingredients?.length) continue;

        const prompt = this.menuPromptBuilder.buildRecipePrompt(meal.title);
        const raw = await this.openaiService.chat(prompt);
        const cleaned = raw.replace(/```json\s*([\s\S]*?)\s*```/, '$1').trim();

        try {
          const parsed = JSON.parse(cleaned);
          meal.recipe = parsed.recipe;
          isUpdated = true;
        } catch (e) {
          console.error(`Ошибка парсинга рецепта для "${meal.title}"`, raw);
        }
      }

      if (isUpdated) {
        await this.menuDayRepository.save(day);
      }
    }

    return transformMenuToCleanDays(menu);
  }

  async calculateMenuNutrition(userId: number): Promise<DailyMenu[]> {
    try {
      const profile = await this.profileService.getMyProfile(userId);
      const targetCalories = profile.calories || 2000;

      const mealTargets = {
        breakfast: Math.round(
          mealCalorieDistribution.breakfast * targetCalories,
        ),
        snack: Math.round(mealCalorieDistribution.snack * targetCalories),
        lunch: Math.round(mealCalorieDistribution.lunch * targetCalories),
        afternoon_snack: Math.round(
          mealCalorieDistribution.afternoon_snack * targetCalories,
        ),
        dinner: Math.round(mealCalorieDistribution.dinner * targetCalories),
      };

      // Загружаем меню вместе с raw сущностями
      const menu = await this.menuRepository.findOne({
        where: { user: { id: userId } },
        relations: ['days'],
        order: { createdAt: 'DESC' },
      });

      if (!menu || !menu.days) throw new Error('Меню не найдено');

      for (const day of menu.days) {
        let totalDayCalories = 0;
        let totalDayProtein = 0;
        let totalDayFat = 0;
        let totalDayCarbs = 0;

        for (const meal of day.meals) {
          let mealCalories = 0;
          let mealProtein = 0;
          let mealFat = 0;
          let mealCarbs = 0;

          for (const ingredient of meal.recipe.ingredients) {
            const match = ingredient.amount.match(/([\d.]+)\s*(г|ml|мл)?/i);
            if (!match) continue;

            const grams = parseFloat(match[1]);
            const data = await this.ingredientService.getOrCreateIngredient(
              ingredient.item,
            );

            mealCalories += (data.calories * grams) / 100;
            mealProtein += (data.protein * grams) / 100;
            mealFat += (data.fat * grams) / 100;
            mealCarbs += (data.carbs * grams) / 100;
          }

          const limit = mealTargets[meal.type];
          if (mealCalories > limit) {
            const result = scaleRecipeByTargetCalories(
              meal.recipe.ingredients,
              {
                calories: mealCalories,
                protein: mealProtein,
                fat: mealFat,
                carbs: mealCarbs,
              },
              limit,
            );

            meal.recipe.ingredients = result.scaledIngredients;
            mealCalories = result.scaledNutrition.calories;
            mealProtein = result.scaledNutrition.protein;
            mealFat = result.scaledNutrition.fat;
            mealCarbs = result.scaledNutrition.carbs;
          }

          meal.calories = Math.round(mealCalories);
          meal.protein = Math.round(mealProtein);
          meal.fat = Math.round(mealFat);
          meal.carbs = Math.round(mealCarbs);

          totalDayCalories += mealCalories;
          totalDayProtein += mealProtein;
          totalDayFat += mealFat;
          totalDayCarbs += mealCarbs;
        }

        day.total = {
          calories: Math.round(totalDayCalories),
          protein: Math.round(totalDayProtein),
          fat: Math.round(totalDayFat),
          carbs: Math.round(totalDayCarbs),
        };

        // Сохраняем изменения по дню
        await this.menuDayRepository.save(day);
      }

      // Загружаем и возвращаем финальный сохранённый вид
      const updated = await this.getSavedMenu(userId);
      return updated!;
    } catch (error) {
      console.error('Ошибка при расчёте КБЖУ:', error);
      throw error;
    }
  }
  async getSavedMenu(userId: number): Promise<DailyMenu[] | null> {
    const menu = await this.menuRepository.findOne({
      where: { user: { id: userId } },
      relations: ['days'],
      order: {
        createdAt: 'DESC',
        days: { day: 'ASC' },
      },
    });

    return menu ? transformMenuToCleanDays(menu) : null;
  }
}
