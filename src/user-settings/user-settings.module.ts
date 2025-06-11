import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSettingsService } from './user-settings.service';
import { UserSettingsController } from './user-settings.controller';
import { UsersModule } from '../users/users.module';
import { UserSettings } from './entities/user-settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSettings]),
    forwardRef(() => UsersModule),
  ],
  providers: [UserSettingsService],
  controllers: [UserSettingsController],
  exports: [UserSettingsService],
})
export class UserSettingsModule {}
