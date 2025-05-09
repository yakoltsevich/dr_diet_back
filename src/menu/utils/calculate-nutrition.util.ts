// src/menu/utils/calculate-nutrition.util.ts
import { IngredientService } from '../../ingredient/ingredient.service';
import { DailyMenu, NutritionInfo } from '../interfaces/daily-menu.interface';

export async function calculateNutritionForMenu(
  menu: DailyMenu[],
  ingredientService: IngredientService,
): Promise<DailyMenu[]> {
  for (const day of menu) {
    const dayTotal: NutritionInfo = {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
    };

    for (const meal of day.meals) {
      const mealNutrition: NutritionInfo = {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
      };

      if (!meal.recipe?.ingredients?.length) continue;

      for (const ingredient of meal.recipe.ingredients) {
        const dbIngredient = await ingredientService.getOrCreateIngredient(
          ingredient.item,
        );
        console.log('dbIngredient', dbIngredient);
        const amountMatch = ingredient.amount.match(/([\d.]+)/);
        const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
        const factor = amount / 100;

        mealNutrition.calories += dbIngredient.calories * factor;
        mealNutrition.protein += dbIngredient.protein * factor;
        mealNutrition.fat += dbIngredient.fat * factor;
        mealNutrition.carbs += dbIngredient.carbs * factor;
      }

      // Округление значений
      meal.calories = Math.round(mealNutrition.calories);
      meal.protein = Math.round(mealNutrition.protein);
      meal.fat = Math.round(mealNutrition.fat);
      meal.carbs = Math.round(mealNutrition.carbs);

      // Добавляем в суточную норму
      dayTotal.calories += meal.calories;
      dayTotal.protein += meal.protein;
      dayTotal.fat += meal.fat;
      dayTotal.carbs += meal.carbs;
    }

    day.total = {
      calories: Math.round(dayTotal.calories),
      protein: Math.round(dayTotal.protein),
      fat: Math.round(dayTotal.fat),
      carbs: Math.round(dayTotal.carbs),
    };
  }

  return menu;
}
