import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BaseController } from '../common/base/base.controller'; // предполагаемая сущность
import { Request } from 'express';

@ApiTags('Users')
@Controller('users')
export class UsersController extends BaseController {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Создать нового пользователя' })
  @ApiBody({
    type: CreateUserDto,
    description: 'Имя, email и пароль пользователя',
  })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно создан',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Ошибки валидации данных' })
  @ApiResponse({
    status: 409,
    description: 'Пользователь с таким email уже существует',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить всех пользователей или найти по email' })
  @ApiQuery({
    name: 'email',
    required: false,
    description: 'Email пользователя для поиска',
  })
  @ApiResponse({
    status: 200,
    description: 'Список пользователей получен',
    type: [User],
  })
  @ApiResponse({
    status: 404,
    description: 'Пользователь с указанным email не найден',
  })
  async find(@Query('email') email?: string) {
    if (email) {
      return this.usersService.findByEmail(email);
    }
    return this.usersService.findAll();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить пользователя по ID' })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Поля для обновления: name, email, password',
  })
  @ApiResponse({
    status: 200,
    description: 'Пользователь успешно обновлен',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Ошибки валидации данных' })
  @ApiResponse({
    status: 404,
    description: 'Пользователь с таким ID не найден',
  })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(Number(id), updateUserDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить текущего пользователя (по JWT)' })
  @ApiResponse({ status: 200, description: 'Текущий пользователь', type: User })
  async getMe(@Req() req: Request) {
    const userId = this.getUserId(req);
    return this.usersService.getMe(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить пользователя по ID' })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь успешно удален' })
  @ApiResponse({
    status: 404,
    description: 'Пользователь с таким ID не найден',
  })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(Number(id));
  }
}
