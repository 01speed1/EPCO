import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('WalletController', () => {
  let controller: WalletController;
  let service: WalletService;

  beforeEach(async () => {
    const mockJwtAuthGuard = {
      canActivate: jest.fn((context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        request.user = { id: 'user-id' };
        return true;
      }),
    };

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
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<WalletController>(WalletController);
    service = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('rechargeWallet', () => {
    it('should recharge wallet successfully', async () => {
      const body = { document: '123456', phone: '9876543210', amount: 50 };
      const req = { user: { id: 'user-id' } };
      const result = await controller.rechargeWallet(req, body);
      expect(result).toEqual({ success: true });
      expect(service.rechargeWallet).toHaveBeenCalledWith(body, req.user);
    });
  });

  describe('getBalance', () => {
    it('should return wallet balance', async () => {
      const document = '123456';
      const phone = '9876543210';
      const req = { user: { id: 'user-id' } };
      const result = await controller.getBalance(req, document, phone);
      expect(result).toEqual({ balance: 100 });
      expect(service.getBalance).toHaveBeenCalledWith(
        document,
        phone,
        req.user,
      );
    });
  });
});
