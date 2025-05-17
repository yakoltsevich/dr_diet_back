// src/meal/entities/meal-ingredient.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Meal } from './meal.entity';
import { Ingredient } from '../../ingredient/entities/ingredient.entity';

@Entity()
export class MealIngredient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  weight: number; // вес в граммах

  @ManyToOne(() => Meal, (meal) => meal.ingredients, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mealId' })
  meal: Meal;

  @ManyToOne(() => Ingredient, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ingredientId' })
  ingredient: Ingredient;
}
