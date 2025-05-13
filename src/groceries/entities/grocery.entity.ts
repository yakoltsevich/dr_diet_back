import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Grocery {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.groceries, { eager: true })
  user: User;

  @Column({ type: 'jsonb' })
  items: {
    item: string;
    amount: string;
  }[];

  @Column({ type: 'varchar', nullable: true })
  title?: string; // например, "Список на неделю"

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
