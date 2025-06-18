import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatedBy, Ingredient } from './entities/ingredient.entity'; // импорт enum
import { OpenaiService } from '../openai/openai.service';
import { buildIngredientPrompt } from './prompts/ingredient.prompt';
import { BaseService } from '../common/base/base.service';
import { FdcService } from '../fdc/fdс.service';
import { UserSettingsService } from '../user-settings/user-settings.service';

@Injectable()
export class IngredientService extends BaseService<Ingredient> {
  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
    private readonly openaiService: OpenaiService,
    private readonly fdcService: FdcService,
    private readonly userSettingsService: UserSettingsService,
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
    name,
    offset,
    limit,
    userId,
  }: {
    name: string;
    offset: number;
    limit: number;
    userId: number;
  }) {
    const settings = await this.userSettingsService.getByUser(userId);
    const sources = settings?.ingredientSources?.length
      ? settings.ingredientSources
      : ['user'];

    const results: any[] = [];

    // 1. Поиск по базе (user и/или ai)
    const dbSources: string[] = [];
    if (sources.includes('user')) dbSources.push('user');
    if (sources.includes('ai')) dbSources.push('ai');

    if (dbSources.length > 0) {
      const qb = this.ingredientRepository.createQueryBuilder('ingredient');

      if (name) {
        qb.where('ingredient.name ILIKE :name', { name: `%${name}%` });
      }

      // Фильтрация по createdBy
      if (dbSources.length === 1) {
        qb.andWhere('ingredient.createdBy = :source', { source: dbSources[0] });
      } else {
        qb.andWhere('ingredient.createdBy IN (:...sources)', {
          sources: dbSources,
        });
      }

      const local = await qb.skip(offset).take(limit).getMany();

      results.push(
        ...local.map((i) => ({
          ...i,
          source: i.createdBy, // либо 'user' либо 'ai'
        })),
      );
    }

    // 2. Поиск в FDC
    if (sources.includes('fdc') && name) {
      const isEnglish = /^[\u0000-\u007F]+$/.test(name);
      if (isEnglish) {
        const fdcResults = await this.fdcService.searchByName(name);
        results.push(...fdcResults);
      }
    }

    return results;
  }
}
