import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Menu } from './menu.entity';
import { Meal, NutritionInfo } from '../interfaces/daily-menu.interface';

@Entity()
export class MenuDay {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Menu, (menu) => menu.days)
  menu: Menu;

  @Column()
  day: number;

  @Column({ type: 'jsonb', nullable: true })
  meals: Meal[];

  @Column({ type: 'jsonb', nullable: true })
  total?: NutritionInfo | null;
}
