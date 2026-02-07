import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LocationsService } from '../../src/locations/locations.service';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('LocationsService', () => {
  let service: LocationsService;

  const prismaMock = {
    department: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    province: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    district: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocationsService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return departments ordered by name', async () => {
    prismaMock.department.findMany.mockResolvedValue([{ id: 1, name: 'LIMA' }]);

    const result = await service.getDepartments();

    expect(result).toHaveLength(1);
    expect(prismaMock.department.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
    });
  });

  it('should throw not found when department does not exist', async () => {
    prismaMock.department.findUnique.mockResolvedValue(null);

    await expect(service.getProvincesByDepartment(99)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return provinces for a department', async () => {
    prismaMock.department.findUnique.mockResolvedValue({ id: 1, name: 'LIMA' });
    prismaMock.province.findMany.mockResolvedValue([
      { id: 10, name: 'LIMA', departmentId: 1 },
    ]);

    const result = await service.getProvincesByDepartment(1);

    expect(result).toHaveLength(1);
    expect(prismaMock.province.findMany).toHaveBeenCalledWith({
      where: { departmentId: 1 },
      orderBy: { name: 'asc' },
    });
  });

  it('should throw not found when province does not exist', async () => {
    prismaMock.province.findUnique.mockResolvedValue(null);

    await expect(service.getDistrictsByProvince(88)).rejects.toThrow(
      NotFoundException,
    );
  });
});
