import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from '../../src/contact/contact.service';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('ContactService', () => {
  let service: ContactService;

  const mockContact = {
    id: 1,
    name: 'Piero Llanos',
    email: 'piero@mail.com',
    phone: '956337419',
    subject: 'Consulta',
    message: 'Necesito informacion',
    createdAt: new Date(),
  };

  const prismaMock = {
    contact: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get<ContactService>(ContactService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create contact', async () => {
    prismaMock.contact.create.mockResolvedValue(mockContact);

    const result = await service.create({
      name: 'Piero Llanos',
      email: 'piero@mail.com',
      phone: '956337419',
      subject: 'Consulta',
      message: 'Necesito informacion',
    });

    expect(result.id).toBe(1);
  });

  it('should return all contacts ordered by createdAt desc', async () => {
    prismaMock.contact.findMany.mockResolvedValue([mockContact]);

    const result = await service.findAll();

    expect(result).toHaveLength(1);
    expect(prismaMock.contact.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should throw not found when contact does not exist', async () => {
    prismaMock.contact.findUnique.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });
});
