import { Test, TestingModule } from '@nestjs/testing';
import { CategoryPackagesController } from '../../src/category-packages/category-packages.controller';
import { CategoryPackagesService } from '../../src/category-packages/category-packages.service';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../src/auth/guards/roles.guard';
import { CreateCategoryPackageDto } from '../../src/category-packages/dto/create-category-package.dto';
import { UpdateCategoryPackageDto } from '../../src/category-packages/dto/update-category-package.dto';

describe('CategoryPackagesController', () => {
  let controller: CategoryPackagesController;

  const mockCategory = {
    id: 1,
    name: 'Aventura',
    createdAt: new Date(),
  };

  const categoryPackagesServiceMock = {
    create: jest.fn().mockResolvedValue(mockCategory),
    findAll: jest.fn().mockResolvedValue({
      data: [
        { id: 1, name: 'Aventura' },
        { id: 2, name: 'Cultural' },
      ],
      meta: {
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    }),
    findOne: jest.fn().mockResolvedValue({
      id: 1,
      name: 'Aventura',
    }),
    update: jest.fn().mockResolvedValue({
      id: 1,
      name: 'Aventura Extrema',
    }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryPackagesController],
      providers: [
        {
          provide: CategoryPackagesService,
          useValue: categoryPackagesServiceMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CategoryPackagesController>(
      CategoryPackagesController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a category package', async () => {
    const dto: CreateCategoryPackageDto = {
      name: 'Aventura',
    };

    const result = await controller.create(dto);

    expect(result.status).toBe('success');
    expect(result.data.id).toBe(1);
    expect(categoryPackagesServiceMock.create).toHaveBeenCalledWith(dto);
  });

  it('should return category packages list', async () => {
    const result = await controller.findAll({ page: 1, limit: 10 });

    expect(result.data.length).toBe(2);
    expect(categoryPackagesServiceMock.findAll).toHaveBeenCalled();
  });

  it('should return category package by id', async () => {
    const result = await controller.findOne(1);

    expect(result.id).toBe(1);
    expect(result.name).toBe('Aventura');
  });

  it('should update category package', async () => {
    const dto: UpdateCategoryPackageDto = {
      name: 'Aventura Extrema',
    };

    const result = await controller.update(1, dto);

    expect(result.status).toBe('success');
    expect(result.data.name).toBe('Aventura Extrema');
    expect(categoryPackagesServiceMock.update).toHaveBeenCalledWith(1, dto);
  });

  it('should delete category package', async () => {
    const result = await controller.remove(1);

    expect(result.status).toBe('success');
    expect(categoryPackagesServiceMock.remove).toHaveBeenCalledWith(1);
  });
});
