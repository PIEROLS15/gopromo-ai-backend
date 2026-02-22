import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from '../../src/roles/roles.controller';
import { RolesService } from '../../src/roles/roles.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from '../../src/roles/dto/create-role.dto';
import { UpdateRoleDto } from '../../src/roles/dto/update-role.dto';

describe('RolesController', () => {
  let controller: RolesController;

  const mockRole = {
    id: 3,
    name: 'Supplier',
  };

  const rolesServiceMock = {
    create: jest.fn().mockResolvedValue(mockRole),
    findAll: jest.fn().mockResolvedValue({
      data: [
        { id: 1, name: 'Admin' },
        { id: 2, name: 'User' },
        { id: 3, name: 'Supplier' },
      ],
      meta: { total: 3, page: 1, limit: 10, totalPages: 1 },
    }),
    findOne: jest.fn().mockResolvedValue({ id: 3, name: 'Supplier' }),
    update: jest.fn().mockResolvedValue({ id: 3, name: 'Provider' }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: rolesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a role', async () => {
    const dto: CreateRoleDto = { name: 'Supplier' };

    const result = await controller.create(dto);

    expect(rolesServiceMock.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({
      status: 'success',
      message: 'Role created successfully',
      data: mockRole,
    });
  });

  it('should return roles list', async () => {
    const result = await controller.findAll({ page: 1, limit: 10 });

    expect(rolesServiceMock.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
    expect(result.data.length).toBe(3);
    expect(result.meta.total).toBe(3);
  });

  it('should return role by id', async () => {
    const result = await controller.findOne(3);

    expect(rolesServiceMock.findOne).toHaveBeenCalledWith(3);
    expect(result).toEqual({ id: 3, name: 'Supplier' });
  });

  it('should update a role', async () => {
    const dto: UpdateRoleDto = { name: 'Provider' };

    const result = await controller.update(3, dto);

    expect(rolesServiceMock.update).toHaveBeenCalledWith(3, dto);
    expect(result).toEqual({
      status: 'success',
      message: 'Role updated successfully',
      data: { id: 3, name: 'Provider' },
    });
  });

  it('should delete a role', async () => {
    const result = await controller.remove(3);

    expect(rolesServiceMock.remove).toHaveBeenCalledWith(3);
    expect(result).toEqual({
      status: 'success',
      message: 'Role deleted successfully',
    });
  });

  it('should throw 404 if role not found (findOne)', async () => {
    jest
      .spyOn(rolesServiceMock, 'findOne')
      .mockRejectedValueOnce(new NotFoundException('Role not found'));

    await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('should throw 409 if role name already exists (create)', async () => {
    jest
      .spyOn(rolesServiceMock, 'create')
      .mockRejectedValueOnce(
        new ConflictException('Role with this name already exists'),
      );

    await expect(controller.create({ name: 'Supplier' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('should throw 409 if role name already exists (update)', async () => {
    jest
      .spyOn(rolesServiceMock, 'update')
      .mockRejectedValueOnce(
        new ConflictException('Role with this name already exists'),
      );

    await expect(controller.update(3, { name: 'Admin' })).rejects.toThrow(
      ConflictException,
    );
  });
});
