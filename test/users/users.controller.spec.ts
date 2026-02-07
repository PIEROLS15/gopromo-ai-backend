import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../src/users/users.controller';
import { UsersService } from '../../src/users/users.service';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../src/auth/guards/roles.guard';
import { ForbiddenException } from '@nestjs/common';
import { UpdateProfileDto } from '../../src/users/dto/update-profile.dto';
import { UpdateUserDto } from '../../src/users/dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUser = {
    id: 15,
    email: 'piero@gmail.com',
    fullName: 'Piero Llanos',
    phone: '+51999999999',
    avatar: null,
  };

  const usersServiceMock = {
    updateProfile: jest.fn().mockResolvedValue(mockUser),
    findAll: jest.fn().mockResolvedValue({
      data: [
        {
          id: 15,
          email: 'piero@gmail.com',
          fullName: 'Piero Llanos',
          role: { id: 3, name: 'User' },
          createdAt: new Date(),
        },
      ],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    }),
    findOne: jest.fn().mockResolvedValue({
      ...mockUser,
      role: { id: 3, name: 'User' },
      createdAt: new Date(),
    }),
    update: jest.fn().mockResolvedValue({ id: 15 }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update authenticated user profile', async () => {
    const req = { user: { id: 15, fullName: 'Piero', role: { name: 'User' } } } as any;
    const dto: UpdateProfileDto = { fullName: 'Piero Llanos' };

    const result = await controller.updateMyProfile(req, dto);

    expect(result.status).toBe('success');
    expect(result.message).toBe('Profile updated successfully');
    expect(usersServiceMock.updateProfile).toHaveBeenCalledWith(15, dto, 'user');
  });

  it('should update authenticated supplier profile', async () => {
    const req = {
      user: { id: 3, representativeName: 'Carlos', role: { name: 'Supplier' } },
    } as any;
    const dto: UpdateProfileDto = { representativeName: 'Carlos Perez' };

    await controller.updateMyProfile(req, dto);

    expect(usersServiceMock.updateProfile).toHaveBeenCalledWith(3, dto, 'supplier');
  });

  it('should return users list', async () => {
    const result = await controller.findAll({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(usersServiceMock.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it('should return user by id', async () => {
    const result = await controller.findOne(15);

    expect(result.id).toBe(15);
    expect(usersServiceMock.findOne).toHaveBeenCalledWith(15);
  });

  it('should update user as admin', async () => {
    const dto: UpdateUserDto = {
      fullName: 'Piero Llanos',
      phone: '+51987654321',
      roleId: 2,
      password: 'Admin1234',
    };

    const result = await controller.update(15, dto);

    expect(result.status).toBe('success');
    expect(result.message).toBe('User updated successfully');
    expect(usersServiceMock.update).toHaveBeenCalledWith(15, dto);
  });

  it('should delete user as admin', async () => {
    const req = { user: { id: 1, fullName: 'Admin', role: { name: 'Admin' } } } as any;

    const result = await controller.remove(req, 15);

    expect(result.status).toBe('success');
    expect(result.message).toBe('User deleted successfully');
    expect(usersServiceMock.remove).toHaveBeenCalledWith(15, 1);
  });

  it('should throw forbidden when supplier tries deleting user', async () => {
    const req = {
      user: { id: 3, representativeName: 'Carlos', role: { name: 'Supplier' } },
    } as any;

    await expect(controller.remove(req, 15)).rejects.toThrow(ForbiddenException);
    expect(usersServiceMock.remove).not.toHaveBeenCalled();
  });
});
