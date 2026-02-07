import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EducationLevelsService } from '../../src/education-levels/education-levels.service';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('EducationLevelsService', () => {
  let service: EducationLevelsService;

  const prismaMock = {
    educationLevel: {
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
        EducationLevelsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<EducationLevelsService>(EducationLevelsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw conflict when level already exists on create', async () => {
    prismaMock.educationLevel.findUnique.mockResolvedValue({ id: 1 });

    await expect(service.create({ name: 'Universitario' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('should return paginated education levels', async () => {
    prismaMock.educationLevel.findMany.mockResolvedValue([
      { id: 1, name: 'Primaria' },
      { id: 2, name: 'Secundaria' },
    ]);
    prismaMock.educationLevel.count.mockResolvedValue(2);

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(2);
    expect(result.meta.total).toBe(2);
  });

  it('should throw not found when education level does not exist', async () => {
    prismaMock.educationLevel.findUnique.mockResolvedValue(null);

    await expect(service.findOne(44)).rejects.toThrow(NotFoundException);
  });

  it('should update education level', async () => {
    prismaMock.educationLevel.findUnique
      .mockResolvedValueOnce({ id: 3, name: 'Universitario' })
      .mockResolvedValueOnce({ id: 3, name: 'Universitario' });
    prismaMock.educationLevel.update.mockResolvedValue({
      id: 3,
      name: 'Universitario Avanzado',
    });

    const result = await service.update(3, { name: 'Universitario Avanzado' });

    expect(result.name).toBe('Universitario Avanzado');
  });

  it('should throw conflict when deleting level with related packages', async () => {
    prismaMock.educationLevel.findUnique.mockResolvedValue({
      id: 2,
      name: 'Secundaria',
    });
    prismaMock.tourPackage.findFirst.mockResolvedValue({ id: 100 });

    await expect(service.remove(2)).rejects.toThrow(ConflictException);
  });
});
