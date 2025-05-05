export interface Ingredient {
  item: string;
  amount: string;
}

export interface Meal {
  type: 'breakfast' | 'snack' | 'lunch' | 'afternoon_snack' | 'dinner';
  title: string; // например: "Овсянка с орехами"
  recipe: {
    ingredients: Ingredient[];
    steps: string[];
  };
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
}

// Меню на один день
export interface DailyMenu {
  day: number; // номер дня в неделе (1–7)
  meals: Meal[];
  totalCalories: number;
  totalProteins: number;
  totalCarbs: number;
  totalFats: number;
}
