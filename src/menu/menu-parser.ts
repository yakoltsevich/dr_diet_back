import { Injectable } from '@nestjs/common';

@Injectable()
export class MenuParser {
  parseSingleDay(content: string, day: number) {
    const lines = content.split('\n').map((line) => line.trim()).filter(Boolean);

    const currentDay = {
      day,
      total: { calories: 0, protein: 0, fat: 0, carbs: 0 },
    };

    let currentMeal: 'breakfast' | 'lunch' | 'dinner' | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('- Завтрак:')) {
        currentMeal = 'breakfast';
        currentDay[currentMeal] = {};
      } else if (line.startsWith('- Обед:')) {
        currentMeal = 'lunch';
        currentDay[currentMeal] = {};
      } else if (line.startsWith('- Ужин:')) {
        currentMeal = 'dinner';
        currentDay[currentMeal] = {};
      } else if (line.startsWith('Блюдо:') && currentMeal) {
        currentDay[currentMeal].dish = line.replace('Блюдо:', '').trim();
      } else if (line.startsWith('Рецепт:') && currentMeal) {
        const recipeLines: string[] = [];
        for (let j = i + 1; j < lines.length; j++) {
          const next = lines[j];
          if (
            next.includes('Калорийность') ||
            next.includes('Белки:') ||
            next.includes('Жиры:') ||
            next.includes('Углеводы:')
          ) {
            break;
          }
          recipeLines.push(next);
        }
        currentDay[currentMeal].recipe = recipeLines.join('\n').trim();
      } else if (
        (line.includes('ккал') || line.includes('Калорийность')) &&
        currentMeal
      ) {
        const calories = line.match(/Калорийность:\s*(\d+)/);
        const protein = line.match(/Белки:\s*(\d+)/);
        const fat = line.match(/Жиры:\s*(\d+)/);
        const carbs = line.match(/Углеводы:\s*(\d+)/);

        currentDay[currentMeal].total = {
          calories: calories ? parseInt(calories[1]) : 0,
          protein: protein ? parseInt(protein[1]) : 0,
          fat: fat ? parseInt(fat[1]) : 0,
          carbs: carbs ? parseInt(carbs[1]) : 0,
        };
      } else if (line.toLowerCase().startsWith('итого')) {
        const allLines = lines.slice(i + 1, i + 3).join(' ');
        const calories = allLines.match(/Калории:\s*(\d+)/);
        const protein = allLines.match(/Белки:\s*(\d+)/);
        const fat = allLines.match(/Жиры:\s*(\d+)/);
        const carbs = allLines.match(/Углеводы:\s*(\d+)/);

        currentDay.total = {
          calories: calories ? parseInt(calories[1]) : 0,
          protein: protein ? parseInt(protein[1]) : 0,
          fat: fat ? parseInt(fat[1]) : 0,
          carbs: carbs ? parseInt(carbs[1]) : 0,
        };
      }
    }

    return currentDay;
  }

}
