import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { MenuModule } from './menu/menu.module';
import { LegalModule } from './legal/legal.module';
import { GroceriesModule } from './groceries/groceries.module';
import { MealModule } from './meal/meal.module';
import { HealthModule } from './health/health.module';

const baseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  autoLoadEntities: true, // ✅ Используем переменную окружения от Render
};

const localConfig: TypeOrmModuleOptions = {
  ...baseConfig,
  username: 'dr_diet_db_user',
  password: process.env.DATABASE_PASSWORD,
  database: 'dr_diet_db',
  autoLoadEntities: true, // автоматически подключает Entity
  synchronize: true, // true для разработки (в проде ставь false)
  ssl: {
    rejectUnauthorized: false,
  },
};
const prodConfig: TypeOrmModuleOptions = {
  ...baseConfig,
  synchronize: false, // ⚠️ Только для разработки, в проде — использовать миграции!
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Делаем .env переменные доступными везде
    }),

    TypeOrmModule.forRoot(
      process.env.NODE_ENV === 'production' ? prodConfig : localConfig,
    ),

    TypeOrmModule.forFeature([User]),
    UsersModule,
    AuthModule,
    UserProfileModule,
    MenuModule,
    LegalModule,
    GroceriesModule,
    MealModule,
    HealthModule,
  ],
})
export class AppModule {}
