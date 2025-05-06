// dish.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Dish {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'afternoon_snack';

  @Column('jsonb')
  recipe: {
    ingredients: { item: string; amount: string }[];
    steps: string[];
  };

  @Column('int')
  calories: number;

  @Column('int')
  protein: number;

  @Column('int')
  fat: number;

  @Column('int')
  carbs: number;
}
