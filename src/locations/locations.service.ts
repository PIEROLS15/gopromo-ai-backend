import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async getDepartments() {
    return this.prisma.department.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getProvincesByDepartment(departmentId: number) {
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException(
        `Department not found with id: ${departmentId}`,
      );
    }

    return this.prisma.province.findMany({
      where: { departmentId },
      orderBy: { name: 'asc' },
    });
  }

  async getDistrictsByProvince(provinceId: number) {
    const province = await this.prisma.province.findUnique({
      where: { id: provinceId },
    });

    if (!province) {
      throw new NotFoundException(`Province not found with id: ${provinceId}`);
    }

    return this.prisma.district.findMany({
      where: { provinceId },
      orderBy: { name: 'asc' },
    });
  }
}
