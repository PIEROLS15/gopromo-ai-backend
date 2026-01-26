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
import { EducationLevelsService } from './education-levels.service';
import { CreateEducationLevelDto } from './dto/create-education-level.dto';
import { UpdateEducationLevelDto } from './dto/update-education-level.dto';
import { EducationLevelQueryDto } from './dto/education-level-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('education-levels')
export class EducationLevelsController {
  constructor(private readonly service: EducationLevelsService) {}

  @Roles('Admin')
  @Post()
  async create(@Body() dto: CreateEducationLevelDto) {
    const level = await this.service.create(dto);

    return {
      status: 'success',
      message: 'Education level created successfully',
      data: level,
    };
  }

  @Roles('Admin', 'Supplier')
  @Get()
  findAll(@Query() query: EducationLevelQueryDto) {
    return this.service.findAll(query);
  }

  @Roles('Admin', 'Supplier')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Roles('Admin')
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEducationLevelDto,
  ) {
    const level = await this.service.update(id, dto);

    return {
      status: 'success',
      message: 'Education level updated successfully',
      data: level,
    };
  }

  @Roles('Admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);

    return {
      status: 'success',
      message: 'Education level deleted successfully',
    };
  }
}
