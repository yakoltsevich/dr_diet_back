import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient, CreatedBy } from './entities/ingredient.entity'; // импорт enum
import { OpenaiService } from '../openai/openai.service';
import { buildIngredientPrompt } from './prompts/ingredient.prompt';
import { BaseService } from '../common/base/base.service';

@Injectable()
export class IngredientService extends BaseService<Ingredient> {
  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepo: Repository<Ingredient>,
    private readonly openaiService: OpenaiService,
  ) {
    super(ingredientRepo);
  }

  async getOrCreateIngredient(name: string): Promise<Ingredient> {
    const existing = await this.ingredientRepo.findOne({ where: { name } });
    if (existing) return existing;

    const prompt = buildIngredientPrompt(name);
    const raw = await this.openaiService.chat(prompt);

    let parsed: any;
    try {
      const cleaned = raw.replace(/```json\s*([\s\S]*?)\s*```/, '$1').trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error(`❌ Невалидный JSON от GPT для "${name}":\n${raw}`);
      throw new Error(`Невалидный JSON от GPT для "${name}"`);
    }

    const { calories, proteins, fats, carbs } = parsed;

    if ([calories, proteins, fats, carbs].some((v) => typeof v !== 'number')) {
      console.error(`❌ Неполные нутриенты для "${name}":`, parsed);
      throw new Error(`Некорректные значения нутриентов для "${name}"`);
    }

    const ingredient = this.ingredientRepo.create({
      name,
      calories,
      protein: proteins,
      fat: fats,
      carbs,
      createdBy: CreatedBy.ai,
    });

    return await this.ingredientRepo.save(ingredient);
  }
}
