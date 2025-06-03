// src/barcode/barcode.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BarcodeService } from './barcode.service';
import { BarcodeController } from './barcode.controller';
import { Ingredient } from '../ingredient/entities/ingredient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ingredient])],
  providers: [BarcodeService],
  controllers: [BarcodeController],
})
export class BarcodeModule {}
