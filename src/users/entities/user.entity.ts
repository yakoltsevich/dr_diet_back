import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Menu } from '../../menu/entities/menu.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true }) // ← добавить это
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  googleId: string;

  @Exclude() // Скрываем пароль при сериализации
  @Column()
  password: string;

  @OneToMany(() => Menu, (menu) => menu.user)
  menus: Menu[];
}
