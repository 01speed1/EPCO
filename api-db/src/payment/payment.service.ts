import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { Payment } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async createPayment(data: {
    document: string;
    phone: string;
    amount: number;
  }): Promise<{ sessionId: string; token: string }> {
    const client = await this.prisma.client.findUnique({
      where: { document: data.document },
    });

    if (!client || client.phone !== data.phone) {
      throw new Error('Client not found or phone number does not match');
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { clientId: client.id },
    });

    if (wallet.balance < data.amount) {
      throw new Error('Insufficient balance');
    }

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const sessionId = uuidv4();

    await this.prisma.payment.create({
      data: {
        amount: data.amount,
        token,
        sessionId,
        walletId: wallet.id,
      },
    });

    await this.mail.sendMail(
      client.email,
      'Payment Confirmation',
      `Your token is: ${token}`,
    );

    return { sessionId, token };
  }

  async confirmPayment(sessionId: string, token: string): Promise<Payment> {
    const payment = await this.prisma.payment.findFirst({
      where: { sessionId },
    });

    if (!payment || payment.token !== token) {
      throw new Error('Invalid session ID or token');
    }

    await this.prisma.wallet.update({
      where: { id: payment.walletId },
      data: { balance: { decrement: payment.amount } },
    });

    return this.prisma.payment.update({
      where: { id: payment.id },
      data: { confirmed: true },
    });
  }
}
