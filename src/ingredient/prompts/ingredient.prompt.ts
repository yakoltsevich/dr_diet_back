export function buildIngredientPrompt(name: string): string {
  return `
Сгенерируй JSON-объект, описывающий количество калорий, белков, жиров и углеводов в 100 г "${name}"

Формат строго JSON. Используй следующую структуру:

\`\`\`json
{
  "ingredient": ${name},
   "calories": 111,
      "proteins": 111,
      "carbs": 111,
      "fats": 111
}
\`\`\`

Убедись, что:
- Формат ответа — **строго валидный JSON**, без пояснений, Markdown или дополнительного текста.
`;
}
