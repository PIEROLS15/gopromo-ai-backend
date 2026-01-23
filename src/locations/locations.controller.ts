import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('departments')
  async getDepartments() {
    return this.locationsService.getDepartments();
  }

  @Get('departments/:id/provinces')
  async getProvincesByDepartment(
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory: () => ({
          statusCode: 400,
          status: 'error',
          message: 'Invalid department ID format',
        }),
      }),
    )
    id: number,
  ) {
    return this.locationsService.getProvincesByDepartment(id);
  }

  @Get('provinces/:id/districts')
  async getDistrictsByProvince(
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory: () => ({
          statusCode: 400,
          status: 'error',
          message: 'Invalid province ID format',
        }),
      }),
    )
    id: number,
  ) {
    return this.locationsService.getDistrictsByProvince(id);
  }
}
