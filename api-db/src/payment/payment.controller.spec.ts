import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

describe('PaymentController', () => {
  let controller: PaymentController;
  let paymentService: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PaymentService,
          useValue: {
            createPayment: jest.fn().mockResolvedValue({ sessionId: '123', token: '456' }),
            confirmPayment: jest.fn().mockResolvedValue({ id: 1, confirmed: true }),
          },
        },
      ],
      controllers: [PaymentController],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    paymentService = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPayment', () => {
    it('should create a payment', async () => {
      const body = { document: '123456', phone: '1234567890', amount: 100 };
      const result = await controller.createPayment(body);
      expect(result).toEqual({ sessionId: '123', token: '456' });
      expect(paymentService.createPayment).toHaveBeenCalledWith(body);
    });
  });

  describe('confirmPayment', () => {
    it('should confirm a payment', async () => {
      const body = { sessionId: '123', token: '456' };
      const result = await controller.confirmPayment(body);
      expect(result).toEqual({ id: 1, confirmed: true });
      expect(paymentService.confirmPayment).toHaveBeenCalledWith('123', '456');
    });
  });
});