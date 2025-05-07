// src/ingredient/entities/ingredient.entity.ts
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['name'])
export class Ingredient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('float')
  calories: number;

  @Column('float')
  protein: number;

  @Column('float')
  fat: number;

  @Column('float')
  carbs: number;
}
