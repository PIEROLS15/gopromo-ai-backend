import { Test, TestingModule } from '@nestjs/testing';
import { TourPackagesService } from '../../src/tour-packages/tour-packages.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { CreateTourPackageDto } from '../../src/tour-packages/dto/create-tour-package.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('TourPackagesService', () => {
  let service: TourPackagesService;

  const mockTourPackage = {
    id: 1,
    name: 'Tour Test',
    pricePersona: 100,
    active: true,
    description: 'Description',
    activities: [],
    includes: [],
    district: {
      name: 'District',
      province: {
        name: 'Province',
        department: { name: 'Department' },
      },
    },
    categoryPackage: { id: 1, name: 'Category' },
    educationLevel: { id: 1, name: 'Level' },
    supplier: { id: 1, companyName: 'Supplier' },
    images: [],
    promotions: [],
    offers: [],
    createdAt: new Date(),
  };

  const prismaMock = {
    tourPackage: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TourPackagesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<TourPackagesService>(TourPackagesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw ConflictException if tour package name already exists', async () => {
      prismaMock.tourPackage.findFirst.mockResolvedValue({ id: 1 });
      const dto = { name: 'Exists' } as unknown as CreateTourPackageDto;

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should create a tour package successfully', async () => {
      prismaMock.tourPackage.findFirst.mockResolvedValue(null);
      prismaMock.tourPackage.create.mockResolvedValue(mockTourPackage);
      const dto = { name: 'New' } as unknown as CreateTourPackageDto;

      const result = await service.create(dto);

      expect(result.name).toBe(mockTourPackage.name);
      expect(prismaMock.tourPackage.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated tour packages', async () => {
      prismaMock.tourPackage.findMany.mockResolvedValue([mockTourPackage]);
      prismaMock.tourPackage.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if tour package not found', async () => {
      prismaMock.tourPackage.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should return a tour package by id', async () => {
      prismaMock.tourPackage.findUnique.mockResolvedValue(mockTourPackage);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
    });
  });

  describe('deactivate', () => {
    it('should throw ConflictException if already inactive', async () => {
      prismaMock.tourPackage.findUnique.mockResolvedValue({
        ...mockTourPackage,
        active: false,
      });

      await expect(service.deactivate(1)).rejects.toThrow(ConflictException);
    });

    it('should deactivate successfully', async () => {
      prismaMock.tourPackage.findUnique.mockResolvedValue(mockTourPackage);

      await service.deactivate(1);

      expect(prismaMock.tourPackage.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { active: false },
      });
    });
  });

  describe('activate', () => {
    it('should throw ConflictException if already active', async () => {
      prismaMock.tourPackage.findUnique.mockResolvedValue({
        ...mockTourPackage,
        active: true,
      });

      await expect(service.activate(1)).rejects.toThrow(ConflictException);
    });

    it('should activate successfully', async () => {
      prismaMock.tourPackage.findUnique.mockResolvedValue({
        ...mockTourPackage,
        active: false,
      });

      await service.activate(1);

      expect(prismaMock.tourPackage.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { active: true },
      });
    });
  });

  describe('remove', () => {
    it('should throw ConflictException if has active reservations', async () => {
      prismaMock.tourPackage.findUnique.mockResolvedValue({
        ...mockTourPackage,
        reservationDetails: [{ reservation: { statusId: 1 } }],
      });

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
    });

    it('should delete successfully if no active reservations', async () => {
      prismaMock.tourPackage.findUnique.mockResolvedValue({
        ...mockTourPackage,
        reservationDetails: [{ reservation: { statusId: 3 } }],
      });

      await service.remove(1);

      expect(prismaMock.tourPackage.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
