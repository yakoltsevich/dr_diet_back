import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { JwtPayload } from '../auth/types/jwt-payload.interface';

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class UserSettingsController {
  constructor(private settingsService: UserSettingsService) {}

  @Get()
  getSettings(@Req() req: AuthenticatedRequest) {
    return this.settingsService.getByUser(req.user.id);
  }

  @Patch()
  updateSettings(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateUserSettingsDto,
  ) {
    try {
      return this.settingsService.update(req.user.id, dto);
    } catch (error) {
      return 'asdasdasd';
    }
  }
}
