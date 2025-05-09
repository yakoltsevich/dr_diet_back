export function buildIngredientPrompt(name: string): string {
  return `
Сгенерируй JSON-объект, описывающий количество калорий, белков, жиров и углеводов в 100 г "${name}".

Формат строго JSON, без пояснений и markdown. Структура:

{
  "ingredient": "${name}",
  "calories": 111,
  "proteins": 111,
  "carbs": 111,
  "fats": 111
}

❗ Никаких комментариев, описаний или markdown, только JSON.
`.trim();
}
