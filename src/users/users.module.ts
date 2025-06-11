import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserSettingsModule } from '../user-settings/user-settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => UserSettingsModule), // ← нужно с обеих сторон!
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // экспортируем для использования в других модулях (например в auth)
})
export class UsersModule {}
