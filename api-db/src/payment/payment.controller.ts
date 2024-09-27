import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createPayment(
    @Body() body: { document: string; phone: string; amount: number },
  ) {
    return this.paymentService.createPayment(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('confirm')
  async confirmPayment(@Body() body: { sessionId: string; token: string }) {
    return this.paymentService.confirmPayment(body.sessionId, body.token);
  }
}
