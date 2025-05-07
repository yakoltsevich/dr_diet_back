import { Injectable } from '@nestjs/common';
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

  async generateWeeklyMenuForUser(userId: number): Promise<DailyMenu[]> {
    console.log('⏳ Получаем профиль пользователя...');
    const profile = await this.profileService.getMyProfile(userId);
    console.log('✅ Профиль получен:', profile);
    const usedMealTitles: Set<string> = new Set();
    const result: DailyMenu[] = [];

    for (let day = 1; day <= 1; day++) {
      console.log(`📤 Генерация промпта на день ${day}...`);
      const prompt = buildDailyMenuPrompt(
        profile,
        day,
        Array.from(usedMealTitles),
      );

      console.log('📡 Отправка запроса в OpenAI...');
      const raw = await this.openaiService.chat(prompt);
      console.log('📩 Ответ от OpenAI:', raw);
      const cleaned = raw.replace(/```json\s*([\s\S]*?)\s*```/, '$1').trim();

      let parsed: DailyMenu;
      try {
        parsed = JSON.parse(cleaned);
      } catch (e) {
        console.error(`GPT ответ (день ${day}):`, raw);
        throw new Error(`Ошибка парсинга OpenAI-ответа на день ${day}`);
      }

      // Добавляем названия всех блюд в список использованных
      for (const meal of parsed.meals) {
        usedMealTitles.add(meal.title.toLowerCase());
      }

      result.push(parsed);
    }

    return result;
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
