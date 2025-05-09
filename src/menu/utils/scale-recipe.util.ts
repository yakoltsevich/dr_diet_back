import { Ingredient, NutritionInfo } from '../interfaces/daily-menu.interface';

interface ScaledResult {
  scaledIngredients: Ingredient[];
  scaledNutrition: NutritionInfo;
  factor: number;
}

export function scaleRecipeByTargetCalories(
  ingredients: Ingredient[],
  currentNutrition: NutritionInfo,
  targetCalories: number,
): ScaledResult {
  // если текущая калорийность меньше цели — ничего не делаем
  if (currentNutrition.calories <= targetCalories) {
    return {
      scaledIngredients: ingredients,
      scaledNutrition: currentNutrition,
      factor: 1,
    };
  }

  const factor = targetCalories / currentNutrition.calories;

  const scaledIngredients = ingredients.map((ing) => {
    const match = ing.amount.match(/([\d.]+)\s*(г|ml|мл)?/i);
    if (!match) return ing;

    const numeric = parseFloat(match[1]);
    const unit = match[2] ?? 'г';
    const newValue = Math.round(numeric * factor);

    return {
      item: ing.item,
      amount: `${newValue} ${unit}`,
    };
  });

  return {
    scaledIngredients,
    scaledNutrition: {
      calories: Math.round(currentNutrition.calories * factor),
      protein: Math.round(currentNutrition.protein * factor),
      fat: Math.round(currentNutrition.fat * factor),
      carbs: Math.round(currentNutrition.carbs * factor),
    },
    factor,
  };
}
