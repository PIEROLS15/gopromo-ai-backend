import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TourPackagesService } from './tour-packages.service';
import { CreateTourPackageDto } from './dto/create-tour-package.dto';
import { UpdateTourPackageDto } from './dto/update-tour-package.dto';
import { TourPackageQueryDto } from './dto/tour-package-query.dto';
import { SearchTourPackageDto } from './dto/search-tour-package.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('tour-packages')
export class TourPackagesController {
  constructor(private readonly service: TourPackagesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Supplier')
  @Post()
  async create(@Body() dto: CreateTourPackageDto) {
    const tour = await this.service.create(dto);
    return {
      status: 'success',
      message: 'Tour package created successfully',
      data: tour,
    };
  }

  @Get()
  findAll(@Query() query: TourPackageQueryDto) {
    return this.service.findAll(query);
  }

  @Get('search')
  async search(@Query() query: SearchTourPackageDto) {
    return this.service.search(query.keyword);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Supplier')
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTourPackageDto,
  ) {
    const tour = await this.service.update(id, dto);
    return {
      status: 'success',
      message: 'Tour package updated successfully',
      data: tour,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Supplier')
  @Patch(':id/activate')
  async activate(@Param('id', ParseIntPipe) id: number) {
    await this.service.activate(id);
    return {
      status: 'success',
      message: 'Tour package activated successfully',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Supplier')
  @Patch(':id/deactivate')
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    await this.service.deactivate(id);
    return {
      status: 'success',
      message: 'Tour package deactivated successfully',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Supplier')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return {
      status: 'success',
      message: 'Tour package deleted successfully',
    };
  }
}
