import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BaseService } from '../common/base/base.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      return await super.create({
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
      });
    } catch (error) {
      throw new BadRequestException(
        `Ошибка создания пользователя: ${error.message}`,
      );
    }
  }
  async getMe(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }
  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('Пользователь с таким email не найден');
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Пользователь с таким ID не найден');
    }

    try {
      return await this.updateOrThrow({ id }, updateUserDto);
    } catch (error) {
      throw new BadRequestException(
        `Ошибка обновления пользователя: ${error.message}`,
      );
    }
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Пользователь с таким ID не найден');
    }

    try {
      await this.removeOrThrow({ id });
    } catch (error) {
      throw new BadRequestException(
        `Ошибка удаления пользователя: ${error.message}`,
      );
    }
  }
}
