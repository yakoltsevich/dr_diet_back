import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { BaseController } from '../common/base/base.controller';

@Controller('menu')
@UseGuards(JwtAuthGuard)
export class MenuController extends BaseController {
  constructor(private readonly menuService: MenuService) {
    super();
  }

  @Post('generate')
  async generateWeeklyMenu(@Req() req: Request) {
    const userId = this.getUserId(req);
    return this.menuService.generateMenuForUser(userId);
  }
}
