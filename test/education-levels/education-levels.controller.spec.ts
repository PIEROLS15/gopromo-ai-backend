import { Test, TestingModule } from '@nestjs/testing';
import { EducationLevelsController } from '../../src/education-levels/education-levels.controller';
import { EducationLevelsService } from '../../src/education-levels/education-levels.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateEducationLevelDto } from '../../src/education-levels/dto/create-education-level.dto';
import { UpdateEducationLevelDto } from '../../src/education-levels/dto/update-education-level.dto';

describe('EducationLevelsController', () => {
  let controller: EducationLevelsController;

  const mockEducationLevel = {
    id: 1,
    name: 'Universitario',
    createdAt: new Date(),
  };

  const educationLevelsServiceMock = {
    create: jest.fn().mockResolvedValue(mockEducationLevel),
    findAll: jest.fn().mockResolvedValue({
      data: [
        { id: 1, name: 'Primaria' },
        { id: 2, name: 'Secundaria' },
        { id: 3, name: 'Universitario' },
      ],
      meta: { total: 3, page: 1, limit: 10, totalPages: 1 },
    }),
    findOne: jest.fn().mockResolvedValue({ id: 3, name: 'Universitario' }),
    update: jest
      .fn()
      .mockResolvedValue({ id: 3, name: 'Universitario Avanzado' }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EducationLevelsController],
      providers: [
        {
          provide: EducationLevelsService,
          useValue: educationLevelsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<EducationLevelsController>(
      EducationLevelsController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an education level', async () => {
    const dto: CreateEducationLevelDto = { name: 'Universitario' };

    const result = await controller.create(dto);

    expect(educationLevelsServiceMock.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({
      status: 'success',
      message: 'Education level created successfully',
      data: mockEducationLevel,
    });
  });

  it('should return education levels list', async () => {
    const result = await controller.findAll({ page: 1, limit: 10 });

    expect(educationLevelsServiceMock.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
    expect(result.data.length).toBe(3);
    expect(result.meta.total).toBe(3);
  });

  it('should return education level by id', async () => {
    const result = await controller.findOne(3);

    expect(educationLevelsServiceMock.findOne).toHaveBeenCalledWith(3);
    expect(result).toEqual({ id: 3, name: 'Universitario' });
  });

  it('should update an education level', async () => {
    const dto: UpdateEducationLevelDto = { name: 'Universitario Avanzado' };

    const result = await controller.update(3, dto);

    expect(educationLevelsServiceMock.update).toHaveBeenCalledWith(3, dto);
    expect(result).toEqual({
      status: 'success',
      message: 'Education level updated successfully',
      data: { id: 3, name: 'Universitario Avanzado' },
    });
  });

  it('should delete an education level', async () => {
    const result = await controller.remove(3);

    expect(educationLevelsServiceMock.remove).toHaveBeenCalledWith(3);
    expect(result).toEqual({
      status: 'success',
      message: 'Education level deleted successfully',
    });
  });

  it('should throw 404 if education level not found (findOne)', async () => {
    jest
      .spyOn(educationLevelsServiceMock, 'findOne')
      .mockRejectedValueOnce(
        new NotFoundException('Education level not found'),
      );

    await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('should throw 409 if education level name already exists (create)', async () => {
    jest
      .spyOn(educationLevelsServiceMock, 'create')
      .mockRejectedValueOnce(
        new ConflictException('Education level with this name already exists'),
      );

    await expect(controller.create({ name: 'Universitario' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('should throw 409 if education level name already exists (update)', async () => {
    jest
      .spyOn(educationLevelsServiceMock, 'update')
      .mockRejectedValueOnce(
        new ConflictException('Education level with this name already exists'),
      );

    await expect(
      controller.update(3, { name: 'Universitario' }),
    ).rejects.toThrow(ConflictException);
  });
});
