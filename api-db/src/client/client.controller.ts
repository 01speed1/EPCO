import { Controller, Post, Body } from '@nestjs/common';
import { ClientService } from './client.service';
import { WalletService } from '../wallet/wallet.service';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService, private readonly walletService: WalletService) {}

  @Post('register')
  async registerClient(
    @Body()
    body: {
      document: string;
      name: string;
      email: string;
      phone: string;
    },
  ) {
    const createdClient = await this.clientService.registerClient(body);
    await this.walletService.createWallet(createdClient.id);

    return createdClient;
  }
}
