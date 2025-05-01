import { Injectable } from '@nestjs/common';

@Injectable()
export class PromptBuilder {
  build(profile: any, dayNumber: number): string {
    const days = [
      'Понедельник',
      'Вторник',
      'Среда',
      'Четверг',
      'Пятница',
      'Суббота',
      'Воскресенье',
    ];
    const dayName = days[dayNumber - 1] || `День ${dayNumber}`;

    return `
Ты профессиональный диетолог. Составь рацион питания на день: ${dayName}.
Ответ должен быть строго в формате валидного JSON, без пояснений, текста до или после.

🔸 Формат ответа:

{
  "day": ${dayNumber},
  "breakfast": {
    "dish": "Название блюда",
    "recipe": {
      "ingredients": [
        { "item": "Название ингредиента", "amount": "Количество с единицей измерения" }
      ],
      "steps": [
        "Пошаговая инструкция 1",
        "Пошаговая инструкция 2"
      ]
    },
    "total": {
      "calories": число,
      "protein": число,
      "fat": число,
      "carbs": число
    }
  },
  "lunch": { ... },
  "dinner": { ... },
  "total": {
    "calories": сумма за день,
    "protein": сумма за день,
    "fat": сумма за день,
    "carbs": сумма за день
  }
}

🔹 Требования:
- Только JSON-объект, без лишнего текста.
- Поле ingredients всегда должно быть массивом объектов с ключами item и amount.
- Поле steps — массив строк.
- Все значения в total — только числа.
- Учитывай, что результат будет обрабатываться автоматически — соблюдай точную структуру.

Профиль пользователя:
- Пол: ${profile.gender}
- Дата рождения: ${profile.birthDate}
- Рост: ${profile.height} см
- Вес: ${profile.weight} кг
- Цель: ${profile.goal}
- Активность: ${profile.activityLevel}
- Аллергии: ${profile.allergies?.join(', ') || 'нет'}
- Предпочтения: ${profile.dietaryPreferences?.join(', ') || 'нет'}
- Любимые продукты: ${profile.favoriteFoods?.join(', ') || 'нет'}
- Нелюбимые продукты: ${profile.dislikedFoods?.join(', ') || 'нет'}
    `.trim();
  }
}
