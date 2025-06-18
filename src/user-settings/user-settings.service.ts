import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { UserSettings } from './entities/user-settings.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private settingsRepo: Repository<UserSettings>,
  ) {}

  async getByUser(userId: number) {
    const settings = await this.settingsRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!settings) throw new NotFoundException('Settings not found');
    return {
      language: settings.language,
      ingredientSources: settings.ingredientSources,
    };
  }

  async update(userId: number, dto: UpdateUserSettingsDto) {
    let settings = await this.settingsRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!settings) {
      settings = this.settingsRepo.create({
        ...dto,
        user: { id: userId } as any,
      });
    } else {
      Object.assign(settings, dto);
    }

    return this.settingsRepo.save(settings);
  }

  async createDefaultForUser(user: User) {
    const settings = this.settingsRepo.create({
      user,
      language: 'en',
      ingredientSources: [],
    });
    return this.settingsRepo.save(settings);
  }
}
