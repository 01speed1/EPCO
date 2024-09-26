import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Wallet } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async rechargeWallet(data: {
    document: string;
    phone: string;
    amount: number;
  }): Promise<Wallet> {
    const client = await this.prisma.client.findUnique({
      where: { document: data.document },
    });

    if (!client || client.phone !== data.phone) {
      throw new Error('Client not found or phone number does not match');
    }

    return this.prisma.wallet.update({
      where: { clientId: client.id },
      data: { balance: { increment: data.amount } },
    });
  }

  async getBalance(document: string, phone: string): Promise<number> {
    const client = await this.prisma.client.findUnique({
      where: { document },
    });

    if (!client || client.phone !== phone) {
      throw new Error('Client not found or phone number does not match');
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { clientId: client.id },
    });

    return wallet.balance;
  }

  async createWallet(clientId: string): Promise<Wallet> {
    const existingWallet = await this.prisma.wallet.findUnique({
      where: { clientId },
    });

    if (existingWallet) {
      throw new Error('Wallet already exists for this client');
    }

    const wallet = await this.prisma.wallet.create({
      data: {
        clientId,
        balance: 0,
      },
    });
    
    return wallet;
  }

}
