import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Menu } from './menu.entity';

@Entity()
export class MenuDay {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Menu, (menu) => menu.days)
  menu: Menu;

  @Column()
  day: number;

  @Column({ type: 'jsonb', nullable: false })
  breakfast: {
    dish: string;
    recipe?: {
      ingredients: { item: string; amount: string }[];
      steps: string[];
    } | null;
    total?: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
    } | null;
  };

  @Column({ type: 'jsonb', nullable: false })
  lunch: {
    dish: string;
    recipe?: {
      ingredients: { item: string; amount: string }[];
      steps: string[];
    } | null;
    total?: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
    } | null;
  };

  @Column({ type: 'jsonb', nullable: false })
  dinner: {
    dish: string;
    recipe?: {
      ingredients: { item: string; amount: string }[];
      steps: string[];
    } | null;
    total?: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
    } | null;
  };

  @Column({ type: 'jsonb', nullable: true })
  total?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  } | null;
}
