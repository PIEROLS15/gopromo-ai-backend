import { Test, TestingModule } from '@nestjs/testing';
import { SuppliersController } from '../../src/suppliers/suppliers.controller';
import { SuppliersService } from '../../src/suppliers/suppliers.service';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../src/auth/guards/roles.guard';
import { UpdateSupplierDto } from '../../src/suppliers/dto/update-supplier.dto';

describe('SuppliersController', () => {
  let controller: SuppliersController;

  const mockSupplier = {
    id: 3,
    companyName: 'Inka Tours SAC',
    email: 'ventas@inkatours.pe',
    ruc: '20123456789',
    phone: '+51987654321',
    avatar: null,
    active: true,
    createdAt: new Date(),
  };

  const suppliersServiceMock = {
    findAll: jest.fn().mockResolvedValue({
      data: [mockSupplier],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    }),
    findOne: jest.fn().mockResolvedValue(mockSupplier),
    update: jest
      .fn()
      .mockResolvedValue({ id: 3, companyName: 'Inka Tours SAC' }),
    updatePartial: jest
      .fn()
      .mockResolvedValue({ id: 3, phone: '+51911112222' }),
    deactivate: jest.fn().mockResolvedValue(undefined),
    activate: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuppliersController],
      providers: [
        {
          provide: SuppliersService,
          useValue: suppliersServiceMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SuppliersController>(SuppliersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return suppliers list', async () => {
    const result = await controller.findAll({ page: 1, limit: 10 });

    expect(result.data.length).toBe(1);
    expect(suppliersServiceMock.findAll).toHaveBeenCalled();
  });

  it('should return supplier by id', async () => {
    const result = await controller.findOne(3);

    expect(result.id).toBe(3);
  });

  it('should update supplier', async () => {
    const dto: UpdateSupplierDto = {
      email: 'ventas@inkatours.pe',
      ruc: '20123456789',
      representativeName: 'Carlos Perez',
      companyName: 'Inka Tours SAC',
      phone: '+51987654321',
      avatar: 'null',
    };

    const result = await controller.update(3, dto);

    expect(result.data.id).toBe(3);
  });

  it('should partially update supplier', async () => {
    const result = await controller.updatePartial(3, {
      phone: '+51911112222',
    });

    expect(result.data.phone).toBe('+51911112222');
  });

  it('should deactivate supplier', async () => {
    await controller.deactivate(3);

    expect(suppliersServiceMock.deactivate).toHaveBeenCalledWith(3);
  });

  it('should activate supplier', async () => {
    await controller.activate(3);

    expect(suppliersServiceMock.activate).toHaveBeenCalledWith(3);
  });

  it('should delete supplier', async () => {
    await controller.remove(3);

    expect(suppliersServiceMock.remove).toHaveBeenCalledWith(3);
  });
});
