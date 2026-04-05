import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthenticatedRequest } from '../auth/types/auth-request.type';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  async updateMyProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    const actorType = 'fullName' in req.user ? 'user' : 'supplier';
    const user = await this.usersService.updateProfile(
      req.user.id,
      dto,
      actorType,
    );

    return {
      status: 'success',
      message: 'Profile updated successfully',
      data: user,
    };
  }

  @Roles('Admin')
  @Get()
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Roles('Admin')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Roles('Admin')
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, dto);

    return {
      status: 'success',
      message: 'User updated successfully',
      data: user,
    };
  }

  @Roles('Admin')
  @Delete(':id')
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (!('fullName' in req.user)) {
      throw new ForbiddenException('You are not allowed to delete this user');
    }

    await this.usersService.remove(id, req.user.id);

    return {
      status: 'success',
      message: 'User deleted successfully',
    };
  }
}
