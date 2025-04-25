import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/authModule';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost', // или 'db', если используешь Docker
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'testdb',
      autoLoadEntities: true, // автоматически подключает Entity
      synchronize: true, // true для разработки (в проде ставь false)
    }),
    AuthModule, // Подключаем AuthModule
    // другие модули
  ],
})
export class AppModule {}
