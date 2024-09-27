import { Test, TestingModule } from '@nestjs/testing';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { WalletService } from '../wallet/wallet.service';

describe('ClientController', () => {
  let controller: ClientController;
  let clientService: ClientService;
  let walletService: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientController],
      providers: [
        {
          provide: ClientService,
          useValue: {
            registerClient: jest
              .fn()
              .mockResolvedValue({
                id: 1,
                document: '123456',
                name: 'John Doe',
                email: 'john@example.com',
                phone: '1234567890',
                password: 'secret',
              }),
          },
        },
        {
          provide: WalletService,
          useValue: {
            createWallet: jest
              .fn()
              .mockResolvedValue({ id: 1, clientId: 1, balance: 0 }),
          },
        },
      ],
    }).compile();

    controller = module.get<ClientController>(ClientController);
    clientService = module.get<ClientService>(ClientService);
    walletService = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerClient', () => {
    it('should call ClientService.registerClient with correct parameters', async () => {
      const body = {
        document: '123456',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        password: 'secret',
      };
      await controller.registerClient(body);
      expect(clientService.registerClient).toHaveBeenCalledWith(body);
      expect(clientService.registerClient).toHaveBeenCalledTimes(1);
    });

    it('should call WalletService.createWallet with correct clientId', async () => {
      const body = {
        document: '123456',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        password: 'secret',
      };
      await controller.registerClient(body);
      expect(walletService.createWallet).toHaveBeenCalledWith(1);
      expect(walletService.createWallet).toHaveBeenCalledTimes(1);
    });

    it('should return the result from ClientService.registerClient without password', async () => {
      const body = {
        document: '123456',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        password: 'secret',
      };
      const result = await controller.registerClient(body);
      expect(result).toEqual({
        id: 1,
        document: '123456',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
      });
    });
  });
});
