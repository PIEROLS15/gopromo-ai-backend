import { Test, TestingModule } from '@nestjs/testing';
import { ContactController } from '../../src/contact/contact.controller';
import { ContactService } from '../../src/contact/contact.service';
import { NotFoundException } from '@nestjs/common';

describe('ContactController', () => {
  let controller: ContactController;
  let service: ContactService;

  const mockContact = {
    id: 1,
    name: 'Piero Llanos',
    email: 'piero@mail.com',
    phone: '956337419',
    subject: 'Quiero adquirir un paquete',
    message: 'Quisiera mas detalles',
    createdAt: new Date(),
  };

  const contactServiceMock = {
    create: jest.fn().mockResolvedValue(mockContact),
    findAll: jest.fn().mockResolvedValue([mockContact]),
    findOne: jest.fn().mockResolvedValue(mockContact),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactController],
      providers: [
        {
          provide: ContactService,
          useValue: contactServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ContactController>(ContactController);
    service = module.get<ContactService>(ContactService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a contact', async () => {
    const dto = {
      name: 'Piero Llanos',
      email: 'piero@mail.com',
      phone: '956337419',
      subject: 'Paquete',
      message: 'Más info',
    };

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({
      status: 'success',
      message: 'Contact created successfully',
      data: mockContact,
    });
  });

  it('should return all contacts', async () => {
    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual([mockContact]);
  });

  it('should return a contact by id', async () => {
    const result = await controller.findOne(1);

    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockContact);
  });

  it('should throw 404 if contact not found', async () => {
    jest
      .spyOn(service, 'findOne')
      .mockRejectedValueOnce(
        new NotFoundException('Contact not found with id: 99'),
      );

    await expect(controller.findOne(99)).rejects.toThrow(NotFoundException);
  });
});
