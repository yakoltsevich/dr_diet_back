// src/user/entities/user-profile.entity.ts

import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActivityLevel, Gender } from '../dto/create-user-profile.dto';
import { User } from '../../users/entities/user.entity';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ type: 'date', nullable: true })
  birthDate?: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender?: Gender;

  @Column('float', { nullable: true })
  height?: number; // см

  @Column('float', { nullable: true })
  weight?: number; // кг

  @Column({ type: 'enum', enum: ActivityLevel, nullable: true })
  activityLevel?: ActivityLevel;

  @Column('text', { array: true, nullable: true })
  allergies?: string[];

  @Column('text', { array: true, nullable: true })
  dietaryPreferences?: string[];

  @Column('text', { array: true, nullable: true })
  medicalConditions?: string[];

  @Column('text', { array: true, nullable: true })
  supplements?: string[];

  @Column('text', { array: true, nullable: true })
  favoriteFoods?: string[];

  @Column('text', { array: true, nullable: true })
  dislikedFoods?: string[];

  @Column('float', { nullable: true })
  calories?: number;

  @Column('float', { nullable: true })
  fats?: number;

  @Column('float', { nullable: true })
  carbs?: number;

  @Column('float', { nullable: true })
  proteins?: number;
}
