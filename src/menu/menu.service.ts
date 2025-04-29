import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserProfileService } from '../user-profile/user-profile.service';
import { OpenAI } from 'openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MenuService {
  private openai: OpenAI;

  constructor(
    private readonly profileService: UserProfileService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException(
        'OpenAI API Key не найден в переменных окружения',
      );
    }

    this.openai = new OpenAI({ apiKey });
  }

  async generateMenuForUser(userId: number) {
    try {
      const profile = await this.profileService.getMyProfile(userId);

      const prompt = this.buildPrompt(profile);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // <= временно ставим эту модель
        messages: [
          { role: 'system', content: 'Ты диетолог. Составь меню на 7 дней.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      });


      const menuText = completion.choices[0]?.message?.content;
      if (!menuText) {
        throw new BadRequestException('Пустой ответ от OpenAI');
      }

      const structuredMenu = this.parseMenu(menuText);

      return {
        menu: structuredMenu,
      };
    } catch (error) {
      console.error('Ошибка при генерации меню:', error);

      if (error.response?.status) {
        throw new BadRequestException(
          `Ошибка OpenAI API: ${error.response.status} - ${error.response.data?.error?.message || error.message}`,
        );
      }

      throw new InternalServerErrorException(
        `Ошибка генерации меню: ${error.message}`,
      );
    }
  }

  private buildPrompt(profile: any): string {
    return `
Составь меню на неделю, 3 приёма пищи в день.
Формат ответа:
Понедельник:
- Завтрак: ...
- Обед: ...
- Ужин: ...

Пол: ${profile.gender}
Возраст: вычисли сам по дате рождения ${profile.birthDate}
Рост: ${profile.height} см
Вес: ${profile.weight} кг
Цель: ${profile.goal}
Активность: ${profile.activityLevel}
Аллергии: ${profile.allergies?.join(', ') || 'нет'}
Предпочтения: ${profile.dietaryPreferences?.join(', ') || 'нет'}
Любимые продукты: ${profile.favoriteFoods?.join(', ') || 'нет'}
Нелюбимые продукты: ${profile.dislikedFoods?.join(', ') || 'нет'}
`;
  }

  private parseMenu(menuText: string) {
    const lines = menuText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const result: Array<{
      day: string;
      breakfast?: string;
      lunch?: string;
      dinner?: string;
    }> = [];

    let currentDay: any = null;

    for (const line of lines) {
      if (line.endsWith(':') && !line.startsWith('-')) {
        // Новый день недели
        if (currentDay) {
          result.push(currentDay);
        }
        currentDay = { day: line.replace(':', '') };
      } else if (line.startsWith('- Завтрак:')) {
        currentDay.breakfast = line.replace('- Завтрак:', '').trim();
      } else if (line.startsWith('- Обед:')) {
        currentDay.lunch = line.replace('- Обед:', '').trim();
      } else if (line.startsWith('- Ужин:')) {
        currentDay.dinner = line.replace('- Ужин:', '').trim();
      }
    }

    if (currentDay) {
      result.push(currentDay);
    }

    return result;
  }
}
