import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Menu } from '../../menu/entities/menu.entity';
import { Grocery } from '../../groceries/entities/grocery.entity'; // добавить импорт
import { UserSettings } from '../../user-settings/entities/user-settings.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  googleId: string;

  @Exclude()
  @Column()
  password: string;

  @OneToMany(() => Menu, (menu) => menu.user)
  menu: Menu[];

  @OneToMany(() => Grocery, (grocery) => grocery.user)
  groceries: Grocery[];

  // 🆕 Связь с настройками пользователя
  @OneToOne(() => UserSettings, (settings) => settings.user, {
    cascade: true,
    eager: true, // если хочешь загружать по умолчанию
  })
  settings: UserSettings;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;
}
