// src/meal/entities/meal.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MealIngredient } from './meal-ingredient.entity';
import { MealType } from '../enums/meal-type.enum';

@Entity()
export class Meal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: MealType,
  })
  type: MealType;

  @Column({ type: 'date' })
  date: string; // формат YYYY-MM-DD

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => MealIngredient, (mi) => mi.meal, { cascade: true })
  ingredients: MealIngredient[];
}
