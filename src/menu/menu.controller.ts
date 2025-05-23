import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MenuService } from './menu.service';
import { Request } from 'express';

@Controller('menu')
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post('generate')
  async generate(@Req() req: Request) {
    const userId = Number((req.user as any).id);
    return this.menuService.generateWeeklyMenuForUser(userId);
  }

  @Post('fill-recipe')
  async fillMenuRecipe(@Req() req: Request) {
    const userId = Number((req.user as any).id);
    return this.menuService.fillRecipesForMenu(userId);
  }

  // menu.controller.ts
  @Post('calculate-nutrition')
  async calculateNutrition(@Req() req: Request) {
    const userId = Number((req.user as any).id);
    const menu = await this.menuService.calculateMenuNutrition(userId);

    return {
      message: 'КБЖУ рассчитано успешно',
      menu,
    };
  }

  @Get()
  async getShoppingList(@Req() req: Request) {
    const userId = Number((req.user as any).id);
    const saved = await this.menuService.getSavedMenu(userId);

    if (!saved) {
      return {
        message: 'Меню не найдено',
        menu: [],
      };
    }

    return {
      message: 'Меню успешно получено',
      menu: saved,
    };
  }
  @Get()
  async getMenu(@Req() req: Request) {
    const userId = Number((req.user as any).id);
    const saved = await this.menuService.getSavedMenu(userId);

    if (!saved) {
      return {
        message: 'Меню не найдено',
        menu: [],
      };
    }

    return {
      message: 'Меню успешно получено',
      menu: saved,
    };
  }
}
