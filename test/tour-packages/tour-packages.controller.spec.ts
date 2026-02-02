import { Test, TestingModule } from '@nestjs/testing';
import { TourPackagesController } from '../../src/tour-packages/tour-packages.controller';
import { TourPackagesService } from '../../src/tour-packages/tour-packages.service';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../src/auth/guards/roles.guard';
import { CreateTourPackageDto } from '../../src/tour-packages/dto/create-tour-package.dto';
import { UpdateTourPackageDto } from '../../src/tour-packages/dto/update-tour-package.dto';

describe('TourPackagesController', () => {
  let controller: TourPackagesController;

  const mockTour = {
    id: 1,
    name: 'Tour Test',
    pricePersona: 350,
  };

  const tourPackagesServiceMock = {
    create: jest.fn().mockResolvedValue(mockTour),
    findAll: jest.fn().mockResolvedValue({ data: [mockTour], meta: {} }),
    findOne: jest.fn().mockResolvedValue(mockTour),
    update: jest.fn().mockResolvedValue({ id: 1, pricePersona: 380 }),
    deactivate: jest.fn().mockResolvedValue(undefined),
    activate: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
    search: jest.fn().mockResolvedValue([mockTour]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TourPackagesController],
      providers: [
        {
          provide: TourPackagesService,
          useValue: tourPackagesServiceMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TourPackagesController>(TourPackagesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a tour package', async () => {
    const dto: CreateTourPackageDto = { name: 'Tour Test' } as any;
    const result = await controller.create(dto);

    expect(result.status).toBe('success');
    expect(result.data).toEqual(mockTour);
    expect(tourPackagesServiceMock.create).toHaveBeenCalledWith(dto);
  });

  it('should return all tour packages', async () => {
    const result = await controller.findAll({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(tourPackagesServiceMock.findAll).toHaveBeenCalled();
  });

  it('should find one by id', async () => {
    const result = await controller.findOne(1);
    expect(result).toEqual(mockTour);
    expect(tourPackagesServiceMock.findOne).toHaveBeenCalledWith(1);
  });

  it('should search tour packages', async () => {
    const result = await controller.search({ keyword: 'test' });
    expect(result).toHaveLength(1);
    expect(tourPackagesServiceMock.search).toHaveBeenCalledWith('test');
  });

  it('should update a tour package', async () => {
    const dto: UpdateTourPackageDto = { pricePersona: 380 };
    const result = await controller.update(1, dto);

    expect(result.status).toBe('success');
    expect(result.data.pricePersona).toBe(380);
    expect(tourPackagesServiceMock.update).toHaveBeenCalledWith(1, dto);
  });

  it('should activate a tour package', async () => {
    const result = await controller.activate(1);
    expect(result.status).toBe('success');
    expect(tourPackagesServiceMock.activate).toHaveBeenCalledWith(1);
  });

  it('should deactivate a tour package', async () => {
    const result = await controller.deactivate(1);
    expect(result.status).toBe('success');
    expect(tourPackagesServiceMock.deactivate).toHaveBeenCalledWith(1);
  });

  it('should remove a tour package', async () => {
    const result = await controller.remove(1);
    expect(result.status).toBe('success');
    expect(tourPackagesServiceMock.remove).toHaveBeenCalledWith(1);
  });
});
