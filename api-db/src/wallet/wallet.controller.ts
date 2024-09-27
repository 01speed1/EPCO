import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @UseGuards(JwtAuthGuard)
  @Post('recharge')
  async rechargeWallet(
    @Req() req,
    @Body() body: { document: string; phone: string; amount: number },
  ) {
    return this.walletService.rechargeWallet(body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('balance')
  async getBalance(
    @Req() req,
    @Query('document') document: string,
    @Query('phone') phone: string,
  ) {
    return this.walletService.getBalance(document, phone, req.user);
  }
}
