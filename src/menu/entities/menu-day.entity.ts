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

  @Column({ type: 'jsonb' })
  breakfast: {
    dish: string;
    recipe: string;
    total: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
    };
  };

  @Column({ type: 'jsonb' })
  lunch: {
    dish: string;
    recipe: string;
    total: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
    };
  };

  @Column({ type: 'jsonb' })
  dinner: {
    dish: string;
    recipe: string;
    total: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
    };
  };

  @Column({ type: 'jsonb' })
  total: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}
