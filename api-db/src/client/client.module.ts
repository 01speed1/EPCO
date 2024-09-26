import { Module } from '@nestjs/common';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { WalletService } from '../wallet/wallet.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ClientController],
  providers: [ClientService, PrismaService, WalletService],
})
export class ClientModule {}
