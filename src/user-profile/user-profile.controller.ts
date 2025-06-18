import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserProfileService } from './user-profile.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { BaseController } from '../common/base/base.controller';
import { UserProfile } from './entities/user-profile.entity';

@ApiTags('User Profile')
@ApiBearerAuth()
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class UserProfileController extends BaseController {
  constructor(private readonly userProfileService: UserProfileService) {
    super();
  }

  @Get('me')
  @ApiOperation({ summary: 'Получить свой профиль' })
  @ApiResponse({
    status: 200,
    description: 'Профиль пользователя',
    type: UserProfile,
  })
  async findMyProfile(@Req() req: Request) {
    const userId = this.getUserId(req);
    console.log('Получить свой профиль', userId);
    return this.userProfileService.getMyProfile(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Создать или обновить свой профиль' })
  @ApiBody({ type: UpdateUserProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Профиль успешно обновлён или создан',
    type: UserProfile,
  })
  @ApiResponse({ status: 400, description: 'Ошибки валидации' })
  async updateMyProfile(
    @Req() req: Request,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    const userId = this.getUserId(req);
    return this.userProfileService.updateMyProfile(
      userId,
      updateUserProfileDto,
    );
  }
}
