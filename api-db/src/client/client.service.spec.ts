import { Test, TestingModule } from '@nestjs/testing';
import { ClientService } from './client.service';
import { PrismaService } from '../prisma/prisma.service';
import { Client } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

describe('ClientService', () => {
  let service: ClientService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        {
          provide: PrismaService,
          useValue: {
            client: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ClientService>(ClientService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerClient', () => {
    it('should register a new client', async () => {
      const clientData = {
        document: '123456789',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        password: 'password123',
      };

      const hashedPassword = await bcrypt.hash(clientData.password, 3);
      const createdClient: Client = {
        id: '1',
        ...clientData,
        password: hashedPassword,
      };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);
      jest
        .spyOn(prismaService.client, 'create')
        .mockResolvedValue(createdClient);

      const result = await service.registerClient(clientData);

      expect(result).toEqual(createdClient);
      expect(prismaService.client.create).toHaveBeenCalledWith({
        data: {
          ...clientData,
          password: hashedPassword,
        },
      });
    });

    it('should throw an error if client creation fails', async () => {
      const clientData = {
        document: '123456789',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        password: 'password123',
      };

      jest
        .spyOn(prismaService.client, 'create')
        .mockRejectedValue(new Error('Client creation failed'));

      await expect(service.registerClient(clientData)).rejects.toThrow(
        'Client creation failed',
      );
    });
  });

  describe('findOne', () => {
    it('should find a client by document', async () => {
      const document = '123456789';
      const client: Client = {
        id: '1',
        document,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        password: 'hashedpassword',
      };

      jest.spyOn(prismaService.client, 'findUnique').mockResolvedValue(client);

      const result = await service.findOne(document);

      expect(result).toEqual(client);
      expect(prismaService.client.findUnique).toHaveBeenCalledWith({
        where: { document },
      });
    });

    it('should return null if client is not found', async () => {
      const document = '123456789';

      jest.spyOn(prismaService.client, 'findUnique').mockResolvedValue(null);

      const result = await service.findOne(document);

      expect(result).toBeNull();
      expect(prismaService.client.findUnique).toHaveBeenCalledWith({
        where: { document },
      });
    });
  });
});
