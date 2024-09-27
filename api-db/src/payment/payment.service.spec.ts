import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-session-id'),
}));

describe('PaymentService', () => {
  let service: PaymentService;
  let prisma: PrismaService;
  let mailService: MailService;
  let configService: ConfigService;

  const sessionId = 'test-session-id';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentService, PrismaService, MailService, ConfigService],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    prisma = module.get<PrismaService>(PrismaService);
    mailService = module.get<MailService>(MailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPayment', () => {
    it('should create a payment successfully', async () => {
      const data = { document: '123456789', phone: '1234567890', amount: 100 };
      const client = {
        id: 1,
        document: '123456789',
        phone: '1234567890',
        email: 'test@example.com',
      };
      const wallet = { id: 1, clientId: 1, balance: 200 };

      const token = '211110';

      prisma.client.findUnique = jest.fn().mockResolvedValue(client);
      prisma.wallet.findUnique = jest.fn().mockResolvedValue(wallet);
      prisma.payment.create = jest.fn().mockResolvedValue({});
      mailService.sendMail = jest.fn().mockResolvedValue({});

      jest.spyOn(global.Math, 'random').mockReturnValue(0.123456);

      const result = await service.createPayment(data);

      expect(result).toEqual({ sessionId, token });
      expect(prisma.client.findUnique).toHaveBeenCalledWith({
        where: { document: data.document },
      });
      expect(prisma.wallet.findUnique).toHaveBeenCalledWith({
        where: { clientId: client.id },
      });
      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: {
          amount: data.amount,
          token,
          sessionId,
          walletId: wallet.id,
        },
      });
      expect(mailService.sendMail).toHaveBeenCalledWith(
        client.email,
        'Payment Confirmation',
        `Your token is: ${token}`,
      );
    });

    it('should throw an error if client is not found', async () => {
      const data = { document: '123456789', phone: '1234567890', amount: 100 };

      prisma.client.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.createPayment(data)).rejects.toThrow(
        'Client not found or phone number does not match',
      );
    });

    it('should throw an error if phone number does not match', async () => {
      const data = { document: '123456789', phone: '1234567890', amount: 100 };
      const client = { id: 1, document: '123456789', phone: '0987654321' };

      prisma.client.findUnique = jest.fn().mockResolvedValue(client);

      await expect(service.createPayment(data)).rejects.toThrow(
        'Client not found or phone number does not match',
      );
    });

    it('should throw an error if balance is insufficient', async () => {
      const data = { document: '123456789', phone: '1234567890', amount: 100 };
      const client = { id: 1, document: '123456789', phone: '1234567890' };
      const wallet = { id: 1, clientId: 1, balance: 50 };

      prisma.client.findUnique = jest.fn().mockResolvedValue(client);
      prisma.wallet.findUnique = jest.fn().mockResolvedValue(wallet);

      await expect(service.createPayment(data)).rejects.toThrow(
        'Insufficient balance',
      );
    });
  });

  describe('confirmPayment', () => {
    it('should confirm a payment successfully', async () => {
      const token = '211110';
      const payment = { id: 1, sessionId, token, walletId: 1, amount: 100 };
      const updatedPayment = { ...payment, confirmed: true };

      prisma.payment.findFirst = jest.fn().mockResolvedValue(payment);
      prisma.wallet.update = jest.fn().mockResolvedValue({});
      prisma.payment.update = jest.fn().mockResolvedValue(updatedPayment);

      const result = await service.confirmPayment(sessionId, token);

      expect(result).toEqual(updatedPayment);
      expect(prisma.payment.findFirst).toHaveBeenCalledWith({
        where: { sessionId },
      });
      expect(prisma.wallet.update).toHaveBeenCalledWith({
        where: { id: payment.walletId },
        data: { balance: { decrement: payment.amount } },
      });
      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: payment.id },
        data: { confirmed: true },
      });
    });

    it('should throw an error if session ID or token is invalid', async () => {
      const token = '211110';

      prisma.payment.findFirst = jest.fn().mockResolvedValue(null);

      await expect(service.confirmPayment(sessionId, token)).rejects.toThrow(
        'Invalid session ID or token',
      );
    });
  });
});
