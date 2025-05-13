import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { GroceriesService } from './groceries.service';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('groceries')
@UseGuards(JwtAuthGuard)
export class GroceriesController {
  constructor(private readonly groceriesService: GroceriesService) {}

  @Get()
  async getOrCreateGroceryList(@Req() req: Request) {
    try {
      const userId = Number((req.user as any).id);
      return this.groceriesService.getOrCreateForUser(userId);
    } catch (error) {
      console.log(error);
    }
  }
}
