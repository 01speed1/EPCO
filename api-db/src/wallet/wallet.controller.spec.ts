import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

describe('WalletController', () => {
  let controller: WalletController;
  let service: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletService,
          useValue: {
            rechargeWallet: jest.fn().mockResolvedValue({ success: true }),
            getBalance: jest.fn().mockResolvedValue({ balance: 100 }),
          },
        },
      ],
    }).compile();

    controller = module.get<WalletController>(WalletController);
    service = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('rechargeWallet', () => {
    it('should recharge wallet successfully', async () => {
      const body = { document: '123456', phone: '9876543210', amount: 50 };
      const result = await controller.rechargeWallet(body);
      expect(result).toEqual({ success: true });
      expect(service.rechargeWallet).toHaveBeenCalledWith(body);
    });
  });

  describe('getBalance', () => {
    it('should return wallet balance', async () => {
      const document = '123456';
      const phone = '9876543210';
      const result = await controller.getBalance(document, phone);
      expect(result).toEqual({ balance: 100 });
      expect(service.getBalance).toHaveBeenCalledWith(document, phone);
    });
  });
});
