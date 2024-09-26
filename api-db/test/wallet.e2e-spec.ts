import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { WalletService } from '../src/wallet/wallet.service';

describe('WalletController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(WalletService)
      .useValue({
        rechargeWallet: jest.fn().mockResolvedValue({
          success: true,
          message: 'Wallet recharged successfully',
        }),
        getBalance: jest.fn().mockResolvedValue({
          document: '123456789',
          phone: '1234567890',
          balance: 100,
        }),
      })

      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/wallet/recharge (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/wallet/recharge')
      .send({ document: '123456789', phone: '1234567890', amount: 100 })
      .expect(201);

    expect(response.body).toEqual({
      success: true,
      message: 'Wallet recharged successfully',
    });
  });

  it('/wallet/balance (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/wallet/balance')
      .query({ document: '123456789', phone: '1234567890' })
      .expect(200);

    expect(response.body).toEqual({
      document: '123456789',
      phone: '1234567890',
      balance: expect.any(Number),
    });
  });
});
