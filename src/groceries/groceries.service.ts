import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grocery } from './entities/grocery.entity';
import { Menu } from '../menu/entities/menu.entity';

@Injectable()
export class GroceriesService {
  constructor(
    @InjectRepository(Grocery)
    private readonly groceryRepo: Repository<Grocery>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  async getOrCreateForUser(userId: number) {
    // const existing = await this.groceryRepo.findOne({
    //   where: { user: { id: userId } },
    //   order: { createdAt: 'DESC' },
    // });
    // console.log('existing:', existing);
    //
    // if (existing) return existing;
    const menu = await this.menuRepository.findOne({
      where: { user: { id: userId } },
      relations: ['days'],
      order: {
        createdAt: 'DESC',
        days: { day: 'ASC' },
      },
    });

    if (!menu) return { items: [] };

    const ingredientMap: Record<string, { amount: number; unit: string }> = {};

    for (const day of menu.days) {
      console.log('day.meals:', day.meals);

      for (const meal of day.meals || []) {
        for (const ing of meal.recipe.ingredients) {
          const match = ing.amount.match(/([\d.]+)\s*(\w+)?/i);
          if (!match) continue;

          const quantity = parseFloat(match[1]);
          const unit = match[2]?.toLowerCase() || 'г';
          const key = `${ing.item.toLowerCase()}|${unit}`;

          if (!ingredientMap[key]) {
            ingredientMap[key] = { amount: 0, unit };
          }

          ingredientMap[key].amount += quantity;
        }
      }
    }
    console.log('ingredientMap:', ingredientMap);

    const items = Object.entries(ingredientMap).map(
      ([key, { amount, unit }]) => {
        const [item] = key.split('|');
        return {
          item,
          amount: `${Math.round(amount)} ${unit}`,
        };
      },
    );

    const grocery = this.groceryRepo.create({
      items,
      title: 'Автоматически созданный список покупок',
    });

    return this.groceryRepo.save(grocery);
  }
}
