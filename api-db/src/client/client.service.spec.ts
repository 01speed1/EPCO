import { Test, TestingModule } from '@nestjs/testing';
import { ClientService } from './client.service';
import { PrismaService } from '../prisma/prisma.service';
import { Client } from '@prisma/client';

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
      };

      const createdClient: Client = {
        id: '1',
        ...clientData,
      };

      jest.spyOn(prismaService.client, 'create').mockResolvedValue(createdClient);

      const result = await service.registerClient(clientData);

      expect(result).toEqual(createdClient);
      expect(prismaService.client.create).toHaveBeenCalledWith({
        data: clientData,
      });
    });

    it('should throw an error if client creation fails', async () => {
      const clientData = {
        document: '123456789',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
      };

      jest.spyOn(prismaService.client, 'create').mockRejectedValue(new Error('Client creation failed'));

      await expect(service.registerClient(clientData)).rejects.toThrow('Client creation failed');
    });
  });
});