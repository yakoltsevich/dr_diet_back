import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from './entities/user-profile.entity';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly profileRepository: Repository<UserProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getMyProfile(userId: number) {
    try {
      const profile = await this.profileRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!profile) {
        throw new NotFoundException('Профиль не найден');
      }

      return profile;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Ошибка при получении профиля');
    }
  }

  async updateMyProfile(userId: number, dto: UpdateUserProfileDto) {
    try {
      let profile = await this.profileRepository.findOne({
        where: { user: { id: userId } },
      });

      if (profile) {
        Object.assign(profile, dto);
      } else {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
          throw new NotFoundException('Пользователь не найден');
        }
        profile = this.profileRepository.create({
          ...dto,
          user,
        });
      }

      return await this.profileRepository.save(profile);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        'Ошибка при обновлении или создании профиля',
      );
    }
  }
}
