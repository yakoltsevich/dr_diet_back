// src/ingredient/entities/ingredient.entity.ts
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

export enum CreatedBy {
  user = 'user',
  admin = 'admin',
  ai = 'ai',
}

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

  @Column({
    type: 'enum',
    enum: CreatedBy,
    default: CreatedBy.ai,
  })
  createdBy: CreatedBy;

  @Column({ type: 'varchar', unique: true, nullable: true })
  barcode: string;
}
