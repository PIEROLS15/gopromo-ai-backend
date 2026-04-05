import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard';
import { RegisterGeneralDto } from '../../src/auth/dto/register-general.dto';
import { RegisterSupplierDto } from '../../src/auth/dto/register-supplier.dto';
import { LoginDto } from '../../src/auth/dto/login.dto';
import type { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;

  const mockUser = {
    id: 1,
    email: 'user@mail.com',
    fullName: 'User Test',
    role: { id: 2, name: 'USER' },
  };

  const mockSupplier = {
    id: 2,
    email: 'supplier@mail.com',
    companyName: 'Supplier SAC',
    role: { id: 3, name: 'SUPPLIER' },
  };

  const authServiceMock = {
    registerGeneral: jest.fn().mockResolvedValue(mockUser),
    registerSupplier: jest.fn().mockResolvedValue(mockSupplier),
    login: jest.fn().mockResolvedValue({
      user: mockUser,
      token: 'jwt-token',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('register general user', async () => {
    const dto: RegisterGeneralDto = {
      email: 'user@mail.com',
      fullName: 'User Test',
      password: 'Password123!',
      educationalInstitution: undefined,
      phone: undefined,
    };

    const res: Partial<Response> = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await controller.registerGeneral(dto, res as Response);

    expect(authServiceMock.registerGeneral).toHaveBeenCalledWith(dto);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('register supplier', async () => {
    const dto: RegisterSupplierDto = {
      email: 'supplier@mail.com',
      ruc: '20123456789',
      representativeName: 'Carlos',
      companyName: 'Supplier SAC',
      phone: '999999999',
      password: 'Password123!',
    };

    const res: Partial<Response> = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await controller.registerSupplier(dto, res as Response);

    expect(authServiceMock.registerSupplier).toHaveBeenCalledWith(dto);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('login user', async () => {
    const dto: LoginDto = {
      email: 'user@mail.com',
      password: 'Password123!',
    };

    const res: Partial<Response> = {
      cookie: jest.fn(),
      json: jest.fn(),
    };

    await controller.login(dto, res as Response);

    expect(authServiceMock.login).toHaveBeenCalledWith(dto);
    expect(res.cookie).toHaveBeenCalled();
  });

  it('logout', () => {
    const res: Partial<Response> = {
      clearCookie: jest.fn(),
      json: jest.fn(),
    };

    controller.logout(res as Response);

    expect(res.clearCookie).toHaveBeenCalledWith('access_token');
  });
});
