import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../src/prisma/prisma.service';
import { UsersService } from '../../src/users/users.service';

jest.mock('../../src/auth/utils/password.util', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('UsersService', () => {
  let service: UsersService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    supplier: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    reservation: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateProfile', () => {
    it('should update profile for authenticated user', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 15 });
      prismaMock.user.update.mockResolvedValue({
        id: 15,
        email: 'piero@gmail.com',
        fullName: 'Piero Llanos Gomez',
        phone: '+51999999999',
        avatar: 'https://cdn.app/new-avatar.png',
      });

      const result = await service.updateProfile(
        15,
        {
          fullName: 'Piero Llanos Gomez',
          phone: '+51999999999',
          avatar: 'https://cdn.app/new-avatar.png',
          password: 'NewPass123',
        },
        'user',
      );

      expect(result.id).toBe(15);
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 15 },
          data: expect.objectContaining({
            fullName: 'Piero Llanos Gomez',
            phone: '+51999999999',
            avatar: 'https://cdn.app/new-avatar.png',
            password: 'hashed-password',
          }),
        }),
      );
    });

    it('should update profile for authenticated supplier', async () => {
      prismaMock.supplier.findUnique.mockResolvedValue({ id: 3 });
      prismaMock.supplier.update.mockResolvedValue({
        id: 3,
        email: 'ventas@inkatours.pe',
        representativeName: 'Carlos Perez',
        companyName: 'Inka Tours SAC',
        phone: '+51911112222',
        avatar: null,
        active: true,
        verified: false,
      });

      const result = await service.updateProfile(
        3,
        {
          representativeName: 'Carlos Perez',
          companyName: 'Inka Tours SAC',
          phone: '+51911112222',
        },
        'supplier',
      );

      expect(result.id).toBe(3);
      expect(prismaMock.supplier.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 3 },
          data: expect.objectContaining({
            representativeName: 'Carlos Perez',
            companyName: 'Inka Tours SAC',
            phone: '+51911112222',
          }),
        }),
      );
    });

    it('should throw NotFoundException when supplier does not exist', async () => {
      prismaMock.supplier.findUnique.mockResolvedValue(null);

      await expect(service.updateProfile(99, {}, 'supplier')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      prismaMock.user.findMany.mockResolvedValue([
        {
          id: 15,
          email: 'piero@gmail.com',
          fullName: 'Piero Llanos',
          role: { id: 3, name: 'User' },
          createdAt: new Date(),
        },
      ]);
      prismaMock.user.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(404)).rejects.toThrow(NotFoundException);
    });

    it('should return user details by id', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 15,
        email: 'piero@gmail.com',
        fullName: 'Piero Llanos',
        phone: '+51999999999',
        avatar: null,
        role: { id: 3, name: 'User' },
        createdAt: new Date(),
      });

      const result = await service.findOne(15);

      expect(result.id).toBe(15);
    });
  });

  describe('update', () => {
    it('should update user by admin', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 15,
        email: 'piero@gmail.com',
        fullName: 'Piero Llanos',
        phone: '+51999999999',
        avatar: null,
        role: { id: 3, name: 'User' },
        createdAt: new Date(),
      });
      prismaMock.user.update.mockResolvedValue({ id: 15 });

      const result = await service.update(15, {
        fullName: 'Piero Llanos Gomez',
        phone: '+51987654321',
        roleId: 2,
        password: 'AdminPass123',
      });

      expect(result.id).toBe(15);
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 15 },
          data: expect.objectContaining({
            fullName: 'Piero Llanos Gomez',
            phone: '+51987654321',
            roleId: 2,
            password: 'hashed-password',
          }),
        }),
      );
    });
  });

  describe('remove', () => {
    it('should throw ForbiddenException when admin deletes itself', async () => {
      await expect(service.remove(10, 10)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException when user has reservations', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 15,
        email: 'piero@gmail.com',
        fullName: 'Piero Llanos',
        phone: '+51999999999',
        avatar: null,
        role: { id: 3, name: 'User' },
        createdAt: new Date(),
      });
      prismaMock.reservation.findFirst.mockResolvedValue({ id: 1, userId: 15 });

      await expect(service.remove(15, 1)).rejects.toThrow(ConflictException);
    });

    it('should delete user when there are no reservations', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 15,
        email: 'piero@gmail.com',
        fullName: 'Piero Llanos',
        phone: '+51999999999',
        avatar: null,
        role: { id: 3, name: 'User' },
        createdAt: new Date(),
      });
      prismaMock.reservation.findFirst.mockResolvedValue(null);
      prismaMock.user.delete.mockResolvedValue({ id: 15 });

      await service.remove(15, 1);

      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id: 15 },
      });
    });
  });
});
