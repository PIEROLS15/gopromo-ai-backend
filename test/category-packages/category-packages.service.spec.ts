import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoryPackagesService } from '../../src/category-packages/category-packages.service';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('CategoryPackagesService', () => {
  let service: CategoryPackagesService;

  const prismaMock = {
    categoryPackage: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    tourPackage: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryPackagesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<CategoryPackagesService>(CategoryPackagesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw conflict when category name already exists on create', async () => {
    prismaMock.categoryPackage.findUnique.mockResolvedValue({ id: 1 });

    await expect(service.create({ name: 'Aventura' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('should create category package', async () => {
    prismaMock.categoryPackage.findUnique.mockResolvedValue(null);
    prismaMock.categoryPackage.create.mockResolvedValue({ id: 1, name: 'Aventura' });

    const result = await service.create({ name: 'Aventura' });

    expect(result.id).toBe(1);
    expect(prismaMock.categoryPackage.create).toHaveBeenCalled();
  });

  it('should return paginated categories', async () => {
    prismaMock.categoryPackage.findMany.mockResolvedValue([{ id: 1, name: 'Aventura' }]);
    prismaMock.categoryPackage.count.mockResolvedValue(1);

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('should throw not found on findOne', async () => {
    prismaMock.categoryPackage.findUnique.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('should update category package', async () => {
    prismaMock.categoryPackage.findUnique
      .mockResolvedValueOnce({ id: 1, name: 'Aventura' })
      .mockResolvedValueOnce({ id: 1, name: 'Aventura' });
    prismaMock.categoryPackage.update.mockResolvedValue({
      id: 1,
      name: 'Aventura Extrema',
    });

    const result = await service.update(1, { name: 'Aventura Extrema' });

    expect(result.name).toBe('Aventura Extrema');
  });

  it('should throw conflict when deleting category with related packages', async () => {
    prismaMock.categoryPackage.findUnique.mockResolvedValue({ id: 1, name: 'Aventura' });
    prismaMock.tourPackage.findFirst.mockResolvedValue({ id: 100 });

    await expect(service.remove(1)).rejects.toThrow(ConflictException);
  });
});
