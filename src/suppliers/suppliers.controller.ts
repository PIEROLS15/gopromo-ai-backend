import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { SupplierQueryDto } from './dto/supplier-query.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { UpdateSupplierPartialDto } from './dto/update-supplier-partial.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Roles('Admin', 'Supplier')
  @Get()
  findAll(@Query() query: SupplierQueryDto) {
    return this.suppliersService.findAll(query);
  }

  @Roles('Admin', 'Supplier')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.findOne(id);
  }

  @Roles('Admin')
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSupplierDto,
  ) {
    const supplier = await this.suppliersService.update(id, dto);
    return {
      status: 'success',
      message: 'Supplier updated successfully',
      data: supplier,
    };
  }

  @Roles('Admin')
  @Patch(':id')
  async updatePartial(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSupplierPartialDto,
  ) {
    const supplier = await this.suppliersService.updatePartial(id, dto);
    return {
      status: 'success',
      message: 'Supplier updated successfully',
      data: supplier,
    };
  }

  @Roles('Admin')
  @Patch(':id/deactivate')
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    await this.suppliersService.deactivate(id);
    return {
      status: 'success',
      message: 'Supplier deactivated successfully',
    };
  }

  @Roles('Admin')
  @Patch(':id/activate')
  async activate(@Param('id', ParseIntPipe) id: number) {
    await this.suppliersService.activate(id);
    return {
      status: 'success',
      message: 'Supplier activated successfully',
    };
  }

  @Roles('Admin')
  @Patch(':id/approve')
  async approve(@Param('id', ParseIntPipe) id: number) {
    const supplier = await this.suppliersService.approve(id);

    return {
      status: 'success',
      message: 'Supplier approved successfully',
      data: supplier,
    };
  }

  @Roles('Admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.suppliersService.remove(id);
    return {
      status: 'success',
      message: 'Supplier deleted successfully',
    };
  }
}
