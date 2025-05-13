import { Menu } from '../entities/menu.entity';
import { DailyMenu } from '../interfaces/daily-menu.interface';

export function transformMenuToCleanDays(menu: Menu): DailyMenu[] {
  return menu.days.map((day) => ({
    day: day.day,
    meals: day.meals,
    total: day.total ?? null,
  }));
}
