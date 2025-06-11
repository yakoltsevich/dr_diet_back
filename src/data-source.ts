import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './users/entities/user.entity';
import { UserSettings } from './user-settings/entities/user-settings.entity';
import { Menu } from './menu/entities/menu.entity';
import { Grocery } from './groceries/entities/grocery.entity';
import { MenuDay } from './menu/entities/menu-day.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: true,
  ssl:
    process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [User, UserSettings, Menu, Grocery, MenuDay],
  migrations: ['src/migrations/*.ts'],
});
