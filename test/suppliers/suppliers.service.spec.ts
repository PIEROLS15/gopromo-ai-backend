import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../src/prisma/prisma.service';
import { SuppliersService } from '../../src/suppliers/suppliers.service';

describe('SuppliersService', () => {
  let service: SuppliersService;

  const prismaMock = {
    supplier: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    tourPackage: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuppliersService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get<SuppliersService>(SuppliersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated suppliers', async () => {
    prismaMock.supplier.findMany.mockResolvedValue([
      {
        id: 3,
        companyName: 'Inka Tours SAC',
        email: 'ventas@inkatours.pe',
        ruc: '20123456789',
        phone: '+51987654321',
        avatar: null,
        active: true,
        verified: false,
        createdAt: new Date(),
      },
    ]);
    prismaMock.supplier.count.mockResolvedValue(1);

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('should throw not found when supplier does not exist', async () => {
    prismaMock.supplier.findUnique.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('should throw conflict when activating an already active supplier', async () => {
    prismaMock.supplier.findUnique.mockResolvedValue({
      id: 3,
      active: true,
      verified: false,
    });

    await expect(service.activate(3)).rejects.toThrow(ConflictException);
  });

  it('should throw conflict when approving an already verified supplier', async () => {
    prismaMock.supplier.findUnique.mockResolvedValue({
      id: 3,
      active: true,
      verified: true,
    });

    await expect(service.approve(3)).rejects.toThrow(ConflictException);
  });

  it('should delete supplier when no related packages exist', async () => {
    prismaMock.supplier.findUnique.mockResolvedValue({
      id: 3,
      active: true,
      verified: false,
    });
    prismaMock.tourPackage.findFirst.mockResolvedValue(null);
    prismaMock.supplier.delete.mockResolvedValue({ id: 3 });

    await service.remove(3);

    expect(prismaMock.supplier.delete).toHaveBeenCalledWith({ where: { id: 3 } });
  });
});
