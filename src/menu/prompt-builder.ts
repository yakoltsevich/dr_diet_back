import { Injectable } from '@nestjs/common';

@Injectable()
export class PromptBuilder {
  buildDishPlan(profile: any): string {
    return `
Ты профессиональный диетолог. Составь меню на неделю (7 дней), начиная с Понедельника.

🔸 Формат ответа — только валидный JSON, строго один из следующих вариантов:
- массив дней: [ { "day": 1, "breakfast": { "dish": "..." }, ... }, ... ]
- или объект с одним из ключей: "data", "days", "menu", "week_menu", внутри которого массив

🔹 Структура каждого дня:
{
  "day": 1,
  "breakfast": { "dish": "Название блюда" },
  "lunch": { "dish": "Название блюда" },
  "dinner": { "dish": "Название блюда" }
}

🔹 Требования:
- Без повторений одного и того же блюда в течение недели
- Без пояснений и текста вне JSON
- Названия блюд должны учитывать предпочтения пользователя

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

  buildNutrientsPrompt(dishName: string, profile: any): string {
    const calories = profile.calories || 1800;
    const protein = profile.proteins || 120;

    return `
Ты нутрициолог. Оцени примерную пищевую ценность блюда "${dishName}" в граммах и калориях.

🔹 Формат ответа — только JSON:
{
  "calories": число, // целое
  "protein": число,  // граммы
  "fat": число,      // граммы
  "carbs": число     // граммы
}

🔸 Требования:
- Расчёт должен соответствовать распределению суточного рациона.
- Итоговая суточная калорийность была **${calories} ± 5%**
- Итоговая суточный белок был **${protein} ± 5%**г
- Примерное распределение: завтрак — 30%, обед — 35%, ужин — 35%.
- Никаких пояснений вне JSON. Только структура выше.
`.trim();
  }

  buildRecipePrompt(dishName: string): string {
    return `
Ты профессиональный повар. Составь рецепт блюда "${dishName}" в формате JSON.

🔹 Формат:
{
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
}

🔸 Требования:
- Строго соблюдать структуру
- Никаких пояснений или текста вне JSON
- Все значения в total — только числа
    `.trim();
  }

  buildRecipeOnlyPrompt(dish: string): string {
    return `
Ты повар. Составь рецепт блюда "${dish}" строго в формате JSON.

🔸 Структура:
{
  "recipe": {
    "ingredients": [
      { "item": "Ингредиент", "amount": "100 г" }
    ],
    "steps": ["Шаг 1", "Шаг 2"]
  }
}

- Никакого текста вне JSON
    `.trim();
  }
  buildMenuWithNutrition(profile: any): string {
    return `
Ты профессиональный диетолог и нутрициолог. Составь план питания на 7 дней с учётом данных пользователя.

🎯 Цель:
- Калории в день: ~${profile.calories || 1800}
- Белки в день: ~${profile.proteins || 120} г
- Распределение по приёмам пищи: завтрак 30%, обед 35%, ужин 35%

📌 Требования:
- Без повторяющихся блюд
- Только JSON — строго структура как ниже
- Не добавляй пояснений или текста вне JSON
- Учитывай предпочтения и аллергию

📦 Формат:
[
  {
    "day": 1,
    "breakfast": {
      "dish": "Овсянка с ягодами",
      "total": {
        "calories": число,
        "protein": число,
        "fat": число,
        "carbs": число
      }
    },
    "lunch": { ... },
    "dinner": { ... }
  },
  ...
]
    
👤 Профиль:
- Пол: ${profile.gender}
- Возраст: ${profile.birthDate}
- Рост: ${profile.height} см
- Вес: ${profile.weight} кг
- Активность: ${profile.activityLevel}
- Цель: ${profile.goal || 'не указана'}
- Аллергии: ${profile.allergies?.join(', ') || 'нет'}
- Предпочтения: ${profile.dietaryPreferences?.join(', ') || 'нет'}
- Любимые продукты: ${profile.favoriteFoods?.join(', ') || 'нет'}
- Нелюбимые продукты: ${profile.dislikedFoods?.join(', ') || 'нет'}
  `.trim();
  }
  buildMenuWithNutritionPrompt(profile: any): string {
    return `
Ты профессиональный диетолог. Составь сбалансированное меню на 7 дней.

🔸 Формат ответа — строго валидный JSON:
{
  "meal_plan": [
    {
      "day": 1,
      "breakfast": {
        "dish": "Название",
        "total": {
          "calories": число,
          "protein": число,
          "fat": число,
          "carbs": число
        }
      },
      "lunch": { ... },
      "dinner": { ... }
    },
    ...
  ]
}

🔹 Требования:
- Не добавляй текст вне JSON
- Используй только числа в total
- Каждый день должен иметь 3 разных блюда (без повторов)
- Меню должно соответствовать потребностям пользователя

📌 Профиль пользователя:
- Пол: ${profile.gender}
- Возраст: ${this.getAge(profile.birthDate)} лет
- Рост: ${profile.height} см
- Вес: ${profile.weight} кг
- Цель: ${profile.goal || 'не указана'}
- Активность: ${profile.activityLevel}
- Калории: ${profile.calories || 'авто'}
- Белки: ${profile.proteins || 'авто'}
- Аллергии: ${profile.allergies?.join(', ') || 'нет'}
- Предпочтения: ${profile.dietaryPreferences?.join(', ') || 'нет'}
- Любимые продукты: ${profile.favoriteFoods?.join(', ') || 'нет'}
- Нелюбимые продукты: ${profile.dislikedFoods?.join(', ') || 'нет'}
    `.trim();
  }

  private getAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
  private getTargetMacrosFromProfile(profile: any) {
    const calories = profile.calories || 1800;
    const protein = profile.proteins || 120;
    const fat = profile.fats || Math.round(0.8 * profile.weight || 70);
    const carbs =
      profile.carbs || Math.round((calories - (protein * 4 + fat * 9)) / 4);

    return { calories, protein, fat, carbs };
  }
}
