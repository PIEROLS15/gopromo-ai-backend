import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from '../../src/roles/roles.service';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('RolesService', () => {
  let service: RolesService;

  const prismaMock = {
    role: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
    supplier: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw conflict when role already exists on create', async () => {
    prismaMock.role.findUnique.mockResolvedValue({ id: 1, name: 'Admin' });

    await expect(service.create({ name: 'Admin' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('should return paginated roles', async () => {
    prismaMock.role.findMany.mockResolvedValue([
      { id: 1, name: 'Admin' },
      { id: 2, name: 'Supplier' },
    ]);
    prismaMock.role.count.mockResolvedValue(2);

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(2);
    expect(result.meta.total).toBe(2);
  });

  it('should throw not found when role does not exist', async () => {
    prismaMock.role.findUnique.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('should update role', async () => {
    prismaMock.role.findUnique
      .mockResolvedValueOnce({ id: 3, name: 'Supplier' })
      .mockResolvedValueOnce({ id: 3, name: 'Supplier' });
    prismaMock.role.update.mockResolvedValue({ id: 3, name: 'Provider' });

    const result = await service.update(3, { name: 'Provider' });

    expect(result.name).toBe('Provider');
  });

  it('should throw conflict when deleting role with related users or suppliers', async () => {
    prismaMock.role.findUnique.mockResolvedValue({ id: 2, name: 'Supplier' });
    prismaMock.user.findFirst.mockResolvedValue({ id: 4 });
    prismaMock.supplier.findFirst.mockResolvedValue(null);

    await expect(service.remove(2)).rejects.toThrow(ConflictException);
  });
});
