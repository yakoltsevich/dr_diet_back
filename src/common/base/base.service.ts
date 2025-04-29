import {
  DeepPartial,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { NotFoundException } from '@nestjs/common';

export class BaseService<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>) {}

  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  async findOneOrThrow(where: FindOptionsWhere<T>): Promise<T> {
    const entity = await this.repository.findOne({ where });
    if (!entity) {
      throw new NotFoundException(`${this.repository.metadata.name} not found`);
    }
    return entity;
  }

  async create(createDto: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(createDto);
    return this.repository.save(entity);
  }

  async updateOrThrow(
    where: FindOptionsWhere<T>,
    updateDto: DeepPartial<T>,
  ): Promise<T> {
    const entity = await this.findOneOrThrow(where);
    Object.assign(entity, updateDto);
    return this.repository.save(entity);
  }

  async removeOrThrow(where: FindOptionsWhere<T>): Promise<void> {
    const entity = await this.findOneOrThrow(where);
    await this.repository.delete((entity as any).id);
  }
}
