import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { PrismaService } from '../prisma/prisma.service';
import { Client } from '@prisma/client';

describe('WalletService', () => {
  let service: WalletService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: PrismaService,
          useValue: {
            client: {
              findUnique: jest.fn(),
            },
            wallet: {
              update: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('rechargeWallet', () => {
    it('should recharge the wallet if client is found, phone matches, and user has permission', async () => {
      const data = { document: '123', phone: '555-5555', amount: 100 };
      const client = { id: 1, document: '123', phone: '555-5555' };
      const wallet = { clientId: 1, balance: 200 };
      const loggedUser = { document: '123' } as Client;

      prismaService.client.findUnique = jest.fn().mockResolvedValue(client);
      prismaService.wallet.update = jest.fn().mockResolvedValue(wallet);

      const result = await service.rechargeWallet(data, loggedUser);

      expect(result).toEqual(wallet);
      expect(prismaService.client.findUnique).toHaveBeenCalledWith({
        where: { document: data.document },
      });
      expect(prismaService.wallet.update).toHaveBeenCalledWith({
        where: { clientId: client.id },
        data: { balance: { increment: data.amount } },
      });
    });

    it('should throw an error if client is not found', async () => {
      const data = { document: '123', phone: '555-5555', amount: 100 };
      const loggedUser = { document: '123' } as Client;

      prismaService.client.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.rechargeWallet(data, loggedUser)).rejects.toThrow(
        'Client not found or phone number does not match',
      );
    });

    it('should throw an error if phone does not match', async () => {
      const data = { document: '123', phone: '555-5555', amount: 100 };
      const client = { id: 1, document: '123', phone: '555-5556' };
      const loggedUser = { document: '123' } as Client;

      prismaService.client.findUnique = jest.fn().mockResolvedValue(client);

      await expect(service.rechargeWallet(data, loggedUser)).rejects.toThrow(
        'Client not found or phone number does not match',
      );
    });

    it('should throw an error if logged user does not have permission', async () => {
      const data = { document: '123', phone: '555-5555', amount: 100 };
      const client = { id: 1, document: '123', phone: '555-5555' };
      const loggedUser = { document: '456' } as Client;

      prismaService.client.findUnique = jest.fn().mockResolvedValue(client);

      await expect(service.rechargeWallet(data, loggedUser)).rejects.toThrow(
        'You do not have permission to recharge this wallet',
      );
    });
  });

  describe('getBalance', () => {
    it('should return the balance if client is found, phone matches, and user has permission', async () => {
      const document = '123';
      const phone = '555-5555';
      const client = { id: 1, document: '123', phone: '555-5555' };
      const wallet = { clientId: 1, balance: 200 };
      const loggedUser = { document: '123' } as Client;

      prismaService.client.findUnique = jest.fn().mockResolvedValue(client);
      prismaService.wallet.findUnique = jest.fn().mockResolvedValue(wallet);

      const result = await service.getBalance(document, phone, loggedUser);

      expect(result).toEqual(wallet.balance);
      expect(prismaService.client.findUnique).toHaveBeenCalledWith({
        where: { document },
      });
      expect(prismaService.wallet.findUnique).toHaveBeenCalledWith({
        where: { clientId: client.id },
      });
    });

    it('should throw an error if client is not found', async () => {
      const document = '123';
      const phone = '555-5555';
      const loggedUser = { document: '123' } as Client;

      prismaService.client.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        service.getBalance(document, phone, loggedUser),
      ).rejects.toThrow('Client not found or phone number does not match');
    });

    it('should throw an error if phone does not match', async () => {
      const document = '123';
      const phone = '555-5555';
      const client = { id: 1, document: '123', phone: '555-5556' };
      const loggedUser = { document: '123' } as Client;

      prismaService.client.findUnique = jest.fn().mockResolvedValue(client);

      await expect(
        service.getBalance(document, phone, loggedUser),
      ).rejects.toThrow('Client not found or phone number does not match');
    });

    it('should throw an error if logged user does not have permission', async () => {
      const document = '123';
      const phone = '555-5555';
      const client = { id: 1, document: '123', phone: '555-5555' };
      const loggedUser = { document: '456' } as Client;

      prismaService.client.findUnique = jest.fn().mockResolvedValue(client);

      await expect(
        service.getBalance(document, phone, loggedUser),
      ).rejects.toThrow('You do not have permission to recharge this wallet');
    });
  });

  describe('createWallet', () => {
    it('should create a wallet if client does not have one', async () => {
      const clientId = '1';
      const wallet = { clientId, balance: 0 };

      prismaService.wallet.findUnique = jest.fn().mockResolvedValue(null);
      prismaService.wallet.create = jest.fn().mockResolvedValue(wallet);

      const result = await service.createWallet(clientId);

      expect(result).toEqual(wallet);
      expect(prismaService.wallet.findUnique).toHaveBeenCalledWith({
        where: { clientId },
      });
      expect(prismaService.wallet.create).toHaveBeenCalledWith({
        data: {
          clientId,
          balance: 0,
        },
      });
    });

    it('should throw an error if wallet already exists for the client', async () => {
      const clientId = '1';
      const wallet = { clientId, balance: 0 };

      prismaService.wallet.findUnique = jest.fn().mockResolvedValue(wallet);

      await expect(service.createWallet(clientId)).rejects.toThrow(
        'Wallet already exists for this client',
      );
      expect(prismaService.wallet.findUnique).toHaveBeenCalledWith({
        where: { clientId },
      });
      expect(prismaService.wallet.create).not.toHaveBeenCalled();
    });
  });
});
