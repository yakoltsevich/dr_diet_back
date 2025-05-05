import { Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MenuService } from './menu.service';
import { Request } from 'express';

@Controller('menu')
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // 🟢 Этап 1 — инициализация меню (только названия блюд)
  @Post('init')
  async init(@Req() req: Request) {
    const userId = Number((req.user as any).id);
    const menu = await this.menuService.initMenuStructure(userId);

    return {
      message: 'Меню создано',
      menu: menu.map(({ menu, ...rest }) => rest), // 👈 удалить menu из ответа
    };
  }

  // 🟡 Этап 2 — добавить нутриенты
  @Patch('add-nutrition')
  async enrichNutrition(@Req() req: Request) {
    const userId = Number((req.user as any).id);
    return this.menuService.enrichMenuWithNutrition(userId);
  }

  // 🔴 Этап 3 — добавить рецепты
  @Patch('add-recipes')
  async enrichRecipes(@Req() req: Request) {
    const userId = Number((req.user as any).id);
    return this.menuService.enrichMenuWithRecipes(userId);
  }

  @Post('generate-full')
  async generateFull(@Req() req: Request) {
    const userId = Number((req.user as any).id);
    return this.menuService.generateMenuWithNutrition(userId);
  }
  @Post('generate')
  async generate(@Req() req: Request) {
    const userId = Number((req.user as any).id);
    return this.menuService.generateMenuForUser(userId);
  }

  // 📦 Получение последнего меню
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
      menu: saved.map(({ menu, ...rest }) => rest), // 👈 здесь удаляется поле menu
    };
  }
}
