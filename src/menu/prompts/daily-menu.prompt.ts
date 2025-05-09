import { UserProfile } from '../../user-profile/entities/user-profile.entity';

export function buildDailyMenuPrompt(
  profile: UserProfile,
  day: number = 1,
  usedMeals: string[] = [],
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

  const usedMealsNote =
    usedMeals.length > 0
      ? `Не используй следующие блюда, они уже были даны ранее: ${usedMeals.join(', ')}.`
      : '';

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

${usedMealsNote}

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
      { "item": "Овсяные хлопья", "amount": "50 г" },
      { "item": "Молоко", "amount": "200 мл" },
      { "item": "Яблоко", "amount": "1 шт" }
    ],
    "steps": [
      "Сварить овсянку на молоке.",
      "Добавить нарезанное яблоко."
    ]
  },
    },
    {
      "type": "lunch",
      ...
    },
    {
      "type": "dinner",
      ...
    }
  ]
}
\`\`\`

Каждое блюдо обязательно содержит поле \`recipe\`, в котором:
- \`ingredients\` — список ингредиентов с количеством;
- \`steps\` — список шагов приготовления.
Поле \`recipe\` не может быть пустым или равным null.
Не используй шт ст.л. ч.л., только граммы

Убедись, что:

- В массиве "meals" содержится не менее трёх приёмов пищи: обязательно "breakfast","snack", "lunch", "dinner" и "afternoon_snack".
- Не используй ранее предложенные блюда: ${usedMealsNote}
- Формат ответа — **строго валидный JSON**, без пояснений, Markdown или дополнительного текста.
`;
}
