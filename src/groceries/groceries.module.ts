import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroceriesController } from './groceries.controller';
import { GroceriesService } from './groceries.service';
import { Grocery } from './entities/grocery.entity';
import { Menu } from '../menu/entities/menu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Grocery, Menu])],
  controllers: [GroceriesController],
  providers: [GroceriesService],
})
export class GroceriesModule {}
