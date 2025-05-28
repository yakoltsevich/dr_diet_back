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
    private readonly ingredientRepository: Repository<Ingredient>,
    private readonly openaiService: OpenaiService,
  ) {
    super(ingredientRepository);
  }

  async getOrCreateIngredient(name: string): Promise<Ingredient> {
    const existing = await this.ingredientRepository.findOne({
      where: { name },
    });
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

    const ingredient = this.ingredientRepository.create({
      name,
      calories,
      protein: proteins,
      fat: fats,
      carbs,
      createdBy: CreatedBy.ai,
    });

    return await this.ingredientRepository.save(ingredient);
  }

  async findAllPaginated({
    offset = 0,
    limit = 20,
  }: {
    offset: number;
    limit: number;
  }) {
    const [items, total] = await this.ingredientRepository.findAndCount({
      skip: offset,
      take: limit,
      order: { name: 'ASC' },
    });

    return {
      data: items,
      total,
      offset,
      limit,
      hasMore: offset + limit < total,
    };
  }
}
