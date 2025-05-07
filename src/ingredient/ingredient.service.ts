// src/ingredient/ingredient.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { OpenaiService } from '../openai/openai.service';
import { buildIngredientPrompt } from './prompts/ingredient.prompt';

@Injectable()
export class IngredientService {
  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepo: Repository<Ingredient>,
    private readonly openaiService: OpenaiService,
  ) {}

  async getOrCreateIngredient(name: string): Promise<Ingredient> {
    const existing = await this.ingredientRepo.findOne({ where: { name } });
    if (existing) return existing;

    const prompt = buildIngredientPrompt(name);
    const raw = await this.openaiService.chat(prompt);
    const match = raw.match(
      /калории:\s*([\d.]+).*белки:\s*([\d.]+).*жиры:\s*([\d.]+).*углеводы:\s*([\d.]+)/i,
    );

    if (!match) {
      throw new Error(
        `Не удалось распарсить нутриенты для "${name}". Ответ: ${raw}`,
      );
    }

    const [_, calories, protein, fat, carbs] = match.map(Number);

    const ingredient = this.ingredientRepo.create({
      name,
      calories,
      protein,
      fat,
      carbs,
    });

    return await this.ingredientRepo.save(ingredient);
  }
}
