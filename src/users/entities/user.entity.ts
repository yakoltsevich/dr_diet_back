import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Menu } from '../../menu/entities/menu.entity';
import { Grocery } from '../../groceries/entities/grocery.entity'; // добавить импорт

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

  @OneToMany(() => Grocery, (grocery) => grocery.user) // ← новая связь
  groceries: Grocery[];
}
