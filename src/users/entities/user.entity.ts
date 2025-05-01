import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Menu } from '../../menu/entities/menu.entity'; // Добавить

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  googleId: string;

  @Exclude() // Скрываем пароль
  @Column()
  password: string;

  // src/user/entities/user.entity.ts
  @OneToMany(() => Menu, (menu) => menu.user)
  menus: Menu[];
}
