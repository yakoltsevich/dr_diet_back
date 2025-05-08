export interface Ingredient {
  item: string;
  amount: string;
}

export interface Meal extends NutritionInfo {
  type: 'breakfast' | 'snack' | 'lunch' | 'afternoon_snack' | 'dinner';
  title: string; // например: "Овсянка с орехами"
  recipe: {
    ingredients: Ingredient[];
    steps: string[];
  };
}

// Меню на один день
export interface DailyMenu {
  day: number; // номер дня в неделе (1–7)
  meals: Meal[];
  total: NutritionInfo | null;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}
