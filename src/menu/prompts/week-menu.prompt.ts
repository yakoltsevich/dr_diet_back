import { Injectable } from '@nestjs/common';
import { UserProfile } from '../../user-profile/entities/user-profile.entity';
import { getAge } from '../utis/get-age.util';

@Injectable()
export class MenuPromptBuilder {
  buildFullWeekMenuPrompt(profile: UserProfile): string {
    return `
Сгенерируй меню на 7 дней недели для пользователя. Формат — строго JSON: массив из 7 объектов.

[
  {
    "day": 1,
    "meals": [
      { "type": "breakfast", "title": "Овсянка с фруктами" },
      { "type": "snack", "title": "Греческий йогурт" },
      { "type": "lunch", "title": "Гречка с курицей" },
      { "type": "afternoon_snack", "title": "Орехи и сухофрукты" },
      { "type": "dinner", "title": "Овощное рагу с фасолью" }
    ]
  },
  ...
]

Требования:
- Дни от 1 до 7. День 1 — понедельник.
- Каждый день включает **ровно 5 приёмов пищи**: breakfast, snack, lunch, afternoon_snack, dinner.
- Только названия блюд. Без рецептов.
- Только валидный JSON. Никаких пояснений, markdown, комментариев.

Информация о пользователе:
- Пол: ${profile.gender}
- Возраст: ${getAge(profile.birthDate)}
- Рост: ${profile.height} см
- Вес: ${profile.weight} кг
- Уровень активности: ${profile.activityLevel}
- Целевые калории: ${profile.calories} ккал
- Б: ${profile.proteins} г / Ж: ${profile.fats ?? 'не указано'} г / У: ${profile.carbs ?? 'не указано'} г
${profile.dietaryPreferences?.length ? `- Диетические предпочтения: ${profile.dietaryPreferences.join(', ')}` : ''}
${profile.allergies?.length ? `- Аллергии: ${profile.allergies.join(', ')}` : ''}
${profile.favoriteFoods?.length ? `- Любимая еда: ${profile.favoriteFoods.join(', ')}` : ''}
${profile.dislikedFoods?.length ? `- Нелюбимая еда: ${profile.dislikedFoods.join(', ')}` : ''}
    `.trim();
  }

  buildRecipePrompt(dish: string): string {
    return `
Сгенерируй JSON-рецепт для блюда "${dish}".

Формат:
\`\`\`json
{
  "recipe": {
    "ingredients": [
      { "item": "Название", "amount": "100 г" }
    ],
    "steps": [
      "Первый шаг",
      "Второй шаг"
    ]
  },
}
\`\`\`

❗ Только JSON. Только граммы. Без markdown и описаний.
`;
  }
}
