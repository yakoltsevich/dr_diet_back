import { Injectable } from '@nestjs/common';
import { UserProfileService } from '../user-profile/user-profile.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { MenuDay } from './entities/menu-day.entity';
import { OpenaiService } from '../openai/openai.service';
import { DailyMenu } from './interfaces/daily-menu.interface';
import { MenuPromptBuilder } from './prompts/week-menu.prompt';
import { transformMenuToCleanDays } from './utis/transformMenu.util';

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

    console.log('menu', !!menu);
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
