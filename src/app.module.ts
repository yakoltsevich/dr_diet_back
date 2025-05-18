import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { MenuModule } from './menu/menu.module';
import { LegalModule } from './legal/legal.module';
import { GroceriesModule } from './groceries/groceries.module';
import { MealModule } from './meal/meal.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Делаем .env переменные доступными везде
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL, // ✅ Используем переменную окружения от Render
      autoLoadEntities: true,
      synchronize: true, // ⚠️ Только для разработки, в проде — использовать миграции!
    }),

    TypeOrmModule.forFeature([User]),
    UsersModule,
    AuthModule,
    UserProfileModule,
    MenuModule,
    LegalModule,
    GroceriesModule,
    MealModule,
  ],
})
export class AppModule {}
// TypeOrmModule.forRoot({
//   type: 'postgres',
//   host: 'localhost', // или 'db', если используешь Docker
//   port: 5432,
//   username: 'postgres',
//   password: 'postgres',
//   database: 'testdb',
//   autoLoadEntities: true, // автоматически подключает Entity
//   synchronize: true, // true для разработки (в проде ставь false)
// }),
//   TypeOrmModule.forFeature([User]),
//   ConfigModule.forRoot({
//     isGlobal: true, // доступен во всем приложении
//   }),