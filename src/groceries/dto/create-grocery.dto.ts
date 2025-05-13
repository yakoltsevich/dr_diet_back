import { Ingredient } from '../../menu/interfaces/daily-menu.interface';

export class CreateGroceryDto {
  userId: number;
  items: Ingredient[];
  title?: string;
}
