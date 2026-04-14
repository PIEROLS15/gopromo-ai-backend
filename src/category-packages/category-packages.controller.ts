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
import { CategoryPackagesService } from './category-packages.service';
import { CreateCategoryPackageDto } from './dto/create-category-package.dto';
import { UpdateCategoryPackageDto } from './dto/update-category-package.dto';
import { CategoryPackageQueryDto } from './dto/category-package-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('category-packages')
export class CategoryPackagesController {
  constructor(private readonly service: CategoryPackagesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Post()
  async create(@Body() dto: CreateCategoryPackageDto) {
    const category = await this.service.create(dto);
    return {
      status: 'success',
      message: 'Category package created successfully',
      data: category,
    };
  }

  @Get()
  findAll(@Query() query: CategoryPackageQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryPackageDto,
  ) {
    const category = await this.service.update(id, dto);
    return {
      status: 'success',
      message: 'Category package updated successfully',
      data: category,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return {
      status: 'success',
      message: 'Category package deleted successfully',
    };
  }
}
