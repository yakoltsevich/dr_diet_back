import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MenuService } from './menu.service';
import { Request } from 'express';
import { GenerateMenuDto } from './dto/generate-menu.dto';

@Controller('menu')
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post('generate')
  async generate(@Body() body: GenerateMenuDto, @Req() req: Request) {
    const userId = Number((req.user as any).id);
    return this.menuService.generateMenuForUser(userId, body.days);
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
