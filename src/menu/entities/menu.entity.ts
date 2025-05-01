import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { MenuDay } from './menu-day.entity';

@Entity()
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.menus, { eager: true })
  user: User;

  @OneToMany(() => MenuDay, (menuDay) => menuDay.menu, {
    cascade: true,
    eager: true,
  })
  days: MenuDay[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
