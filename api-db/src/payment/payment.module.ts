import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, PrismaService, MailService],
})
export class PaymentModule {}
