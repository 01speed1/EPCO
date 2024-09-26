import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PaymentModule } from '../src/payment/payment.module';
import { PaymentService } from '../src/payment/payment.service';

describe('PaymentController (e2e)', () => {
  let app: INestApplication;
  const paymentService = {
    createPayment: () => ['test'],
    confirmPayment: () => ['test'],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PaymentModule],
    })
      .overrideProvider(PaymentService)
      .useValue(paymentService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/POST payment/create', () => {
    return request(app.getHttpServer())
      .post('/payment/create')
      .send({ document: '123456789', phone: '1234567890', amount: 100 })
      .expect(201)
      .expect(paymentService.createPayment());
  });

  it('/POST payment/confirm', () => {
    return request(app.getHttpServer())
      .post('/payment/confirm')
      .send({ sessionId: 'session123', token: 'token123' })
      .expect(201)
      .expect(paymentService.confirmPayment());
  });

  afterAll(async () => {
    await app.close();
  });
});
