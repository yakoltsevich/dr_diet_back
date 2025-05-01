import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UserProfileService } from '../user-profile/user-profile.service';
import { PromptBuilder } from './prompt-builder';
import { OpenAiClient } from './openai.client';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { MenuDay } from './entities/menu-day.entity';

@Injectable()
export class MenuService {
  constructor(
    private readonly profileService: UserProfileService,
    private readonly promptBuilder: PromptBuilder,
    private readonly openAiClient: OpenAiClient,

    @InjectRepository(Menu)
    private readonly menuRepo: Repository<Menu>,

    @InjectRepository(MenuDay)
    private readonly menuDayRepo: Repository<MenuDay>,
  ) {}

  async generateMenuForUser(userId: number, days?: number[]): Promise<{ menu: MenuDay[] }> {
    const existing = await this.getSavedMenu(userId);
    if (existing) return { menu: existing };

    const profile = await this.profileService.getMyProfile(userId);
    const dayList = days && days.length ? days : [1, 2, 3, 4, 5, 6, 7];

    const menuDays: MenuDay[] = await Promise.all(
      dayList.map(async (day) => {
        const prompt = this.promptBuilder.build(profile, day);

        const messages: { role: 'system' | 'user'; content: string }[] = [
          {
            role: 'system',
            content: 'Ты диетолог. Ответ строго в формате JSON.',
          },
          { role: 'user', content: prompt },
        ];

        try {
          const completion = await this.openAiClient.chat(messages, 4000, 'json_object');
          const response = completion.choices[0]?.message?.content;
          if (!response) throw new Error('Пустой ответ от OpenAI');

          const parsed = JSON.parse(response);

          const menuDay = this.menuDayRepo.create({
            day,
            breakfast: parsed.breakfast,
            lunch: parsed.lunch,
            dinner: parsed.dinner,
            total: parsed.total,
          });

          return menuDay;
        } catch (error) {
          console.error(`Ошибка генерации дня ${day}:`, error);
          throw new InternalServerErrorException(`Ошибка генерации меню на день ${day}: ${error.message}`);
        }
      }),
    );

    const menuEntity = this.menuRepo.create({
      user: { id: userId },
      days: menuDays,
    });

    await this.menuRepo.save(menuEntity);

    return { menu: menuEntity.days };
  }

  async getSavedMenu(userId: number): Promise<MenuDay[] | null> {
    const existingMenu = await this.menuRepo.findOne({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      relations: ['days'],
    });

    return existingMenu?.days || null;
  }
}
