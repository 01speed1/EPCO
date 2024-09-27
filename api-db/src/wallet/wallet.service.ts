import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Wallet, Client } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async rechargeWallet(
    data: {
      document: string;
      phone: string;
      amount: number;
    },
    loggedUser: Client,
  ): Promise<Wallet> {
    const client = await this.prisma.client.findUnique({
      where: { document: data.document },
    });

    if (!client || client.phone !== data.phone) {
      throw new Error('Client not found or phone number does not match');
    }

    if (loggedUser.document !== client.document) {
      throw new Error('You do not have permission to recharge this wallet');
    }

    return this.prisma.wallet.update({
      where: { clientId: client.id },
      data: { balance: { increment: data.amount } },
    });
  }

  async getBalance(
    document: string,
    phone: string,
    loggedUser: Client,
  ): Promise<number> {
    const client = await this.prisma.client.findUnique({
      where: { document },
    });

    if (!client || client.phone !== phone) {
      throw new Error('Client not found or phone number does not match');
    }

    if (loggedUser.document !== client.document) {
      throw new Error('You do not have permission to recharge this wallet');
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

  async findByClientDocument(document: string): Promise<Wallet | null> {
    const client = await this.prisma.client.findUnique({
      where: { document },
    });

    if (!client) {
      throw new Error('Client not found');
    }

    return this.prisma.wallet.findUnique({
      where: { clientId: client.id },
    });
  }
}
