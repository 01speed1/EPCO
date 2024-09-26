import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create')
  async createPayment(
    @Body() body: { document: string; phone: string; amount: number },
  ) {
    return this.paymentService.createPayment(body);
  }

  @Post('confirm')
  async confirmPayment(@Body() body: { sessionId: string; token: string }) {
    return this.paymentService.confirmPayment(body.sessionId, body.token);
  }
}
