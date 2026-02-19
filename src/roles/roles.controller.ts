import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleQueryDto } from './dto/role-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Roles('Admin')
  @Post()
  async create(@Body() dto: CreateRoleDto) {
    const role = await this.service.create(dto);

    return {
      status: 'success',
      message: 'Role created successfully',
      data: role,
    };
  }

  @Roles('Admin')
  @Get()
  findAll(@Query() query: RoleQueryDto) {
    return this.service.findAll(query);
  }

  @Roles('Admin')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Roles('Admin')
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ) {
    const role = await this.service.update(id, dto);

    return {
      status: 'success',
      message: 'Role updated successfully',
      data: role,
    };
  }

  @Roles('Admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);

    return {
      status: 'success',
      message: 'Role deleted successfully',
    };
  }
}
