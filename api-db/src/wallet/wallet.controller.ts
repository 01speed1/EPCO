import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('recharge')
  async rechargeWallet(
    @Body() body: { document: string; phone: string; amount: number },
  ) {
    return this.walletService.rechargeWallet(body);
  }

  @Get('balance')
  async getBalance(
    @Query('document') document: string,
    @Query('phone') phone: string,
  ) {
    return this.walletService.getBalance(document, phone);
  }
}
