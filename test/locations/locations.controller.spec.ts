import { Test, TestingModule } from '@nestjs/testing';
import { LocationsController } from '../../src/locations/locations.controller';
import { LocationsService } from '../../src/locations/locations.service';
import { NotFoundException } from '@nestjs/common';

describe('LocationsController', () => {
  let controller: LocationsController;

  const mockDepartments = [
    { id: 1, name: 'LIMA' },
    { id: 2, name: 'CUSCO' },
  ];

  const mockProvinces = [
    { id: 10, name: 'LIMA', departmentId: 1 },
    { id: 11, name: 'BARRANCA', departmentId: 1 },
  ];

  const mockDistricts = [
    {
      id: 100,
      name: 'MIRAFLORES',
      ubigeo: '140115',
      inei: '150122',
      provinceId: 10,
    },
  ];

  const locationsServiceMock = {
    getDepartments: jest.fn().mockResolvedValue(mockDepartments),
    getProvincesByDepartment: jest.fn().mockResolvedValue(mockProvinces),
    getDistrictsByProvince: jest.fn().mockResolvedValue(mockDistricts),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationsController],
      providers: [
        {
          provide: LocationsService,
          useValue: locationsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<LocationsController>(LocationsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all departments', async () => {
    const result = await controller.getDepartments();

    expect(locationsServiceMock.getDepartments).toHaveBeenCalled();
    expect(result).toEqual(mockDepartments);
  });

  it('should return provinces by department id', async () => {
    const result = await controller.getProvincesByDepartment(1);

    expect(locationsServiceMock.getProvincesByDepartment).toHaveBeenCalledWith(
      1,
    );
    expect(result).toEqual(mockProvinces);
  });

  it('should throw 404 if department not found', async () => {
    jest
      .spyOn(locationsServiceMock, 'getProvincesByDepartment')
      .mockRejectedValueOnce(
        new NotFoundException('Department not found with id: 99'),
      );

    await expect(controller.getProvincesByDepartment(99)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return districts by province id', async () => {
    const result = await controller.getDistrictsByProvince(10);

    expect(locationsServiceMock.getDistrictsByProvince).toHaveBeenCalledWith(
      10,
    );
    expect(result).toEqual(mockDistricts);
  });

  it('should throw 404 if province not found', async () => {
    jest
      .spyOn(locationsServiceMock, 'getDistrictsByProvince')
      .mockRejectedValueOnce(
        new NotFoundException('Province not found with id: 99'),
      );

    await expect(controller.getDistrictsByProvince(99)).rejects.toThrow(
      NotFoundException,
    );
  });
});
