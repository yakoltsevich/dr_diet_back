import { UserProfile } from '../../user-profile/entities/user-profile.entity';

export function buildDailyMenuPrompt(
  profile: UserProfile,
  day: number = 1,
): string {
  const getAge = (birthDate: string | undefined): number | string => {
    if (!birthDate) return 'не задано';
    const dob = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    if (
      now.getMonth() < dob.getMonth() ||
      (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())
    ) {
      age--;
    }
    return age;
  };
  const allergies =
    profile.allergies && `Аллергии: ${profile.allergies.join(', ') || 'нет'} `;
  const dietaryPreferences =
    profile.dietaryPreferences &&
    `Диетические предпочтения: ${profile.dietaryPreferences.join(', ') || 'нет'} `;
  const favoriteFoods =
    profile.favoriteFoods &&
    `Любимая еда: ${profile.favoriteFoods.join(', ') || 'нет'} `;
  const dislikedFoods =
    profile.dislikedFoods &&
    `Нелюбимая еда: ${profile.dislikedFoods.join(', ') || 'нет'} `;

  return `
Сгенерируй JSON-объект, описывающий меню на день номер ${day} для пользователя на основе следующих параметров:

Возраст: ${getAge(profile.birthDate)}  
Пол: ${profile.gender}  
Рост: ${profile.height} см  
Вес: ${profile.weight} кг  
Уровень активности: ${profile.activityLevel}  
Калории: ${profile.calories}  
Белки: ${profile.proteins}  
Жиры: ${profile.fats ?? 'не указано'}  
Углеводы: ${profile.carbs ?? 'не указано'}  

${allergies}
${dietaryPreferences}
${favoriteFoods}
${dislikedFoods}

Формат строго JSON. Используй следующую структуру:

\`\`\`json
{
  "day": ${day},
  "meals": [
    {
      "type": "breakfast",
      "title": "Название блюда",
      "recipe": {
        "ingredients": [
          { "item": "ингредиент", "amount": "кол-во" }
        ],
        "steps": [
          "шаг 1",
          "шаг 2"
        ]
      },
      "calories": 400,
      "proteins": 25,
      "carbs": 30,
      "fats": 15
    },
    {
      "type": "lunch",
      ...
    },
    {
      "type": "dinner",
      ...
    }
  ],
  "totalCalories": ${profile.calories},
  "totalProteins": ${profile.proteins},
  "totalCarbs": ${profile.carbs},
  "totalFats": ${profile.fats}
}
\`\`\`
Убедись, что:

- В массиве "meals" содержится не менее трёх приёмов пищи: обязательно "breakfast", "lunch" и "dinner". Дополнительно можно добавить "snack" и "afternoon_snack".
- Каждый приём пищи содержит реалистичное количество калорий, белков, жиров и углеводов:
  - завтрак — около 400 ккал,
  - обед и ужин — по 500–600 ккал,
  - перекусы (если есть) — около 200 ккал.
- Сумма значений \`calories\`, \`proteins\`, \`fats\`, \`carbs\` по всем приёмам пищи **должна в точности соответствовать** итоговым полям: \`totalCalories\`, \`totalProteins\`, \`totalFats\`, \`totalCarbs\`.
- Значения КБЖУ по каждому блюду должны быть **обоснованы конкретными ингредиентами**. Подсчёт калорий, белков, жиров и углеводов должен быть реалистичным и основан на типичных пищевых данных.
- Не завышай белки, жиры или углеводы без соответствующих продуктов в составе. Если заданные макросы не набираются — **увеличь порции** или **добавь перекус**.
- Используй только реальные, натуральные продукты. Не добавляй скрытых добавок или искусственно повышающих КБЖУ ингредиентов.
- Формат ответа — **строго валидный JSON**, без пояснений, Markdown или дополнительного текста. Только структура, как в примере ниже.
- Перед выводом JSON убедись, что суммарные значения totalCalories, totalProteins, totalCarbs и totalFats совпадают с арифметической суммой этих значений из каждого блюда. Не пиши их "на глаз".
- Перед выводом JSON пересчитай сумму КБЖУ по каждому блюду и сравни её с итоговыми полями. Если недостает калорий или белков — увеличь порции или добавь перекус. Итоговые totalCalories, totalProteins и т.д. должны быть строго арифметически равны сумме значений по блюдам.

`;
}
