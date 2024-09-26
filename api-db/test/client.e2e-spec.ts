import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { ClientController } from '../src/client/client.controller';
import { ClientService } from '../src/client/client.service';

describe('ClientController (e2e)', () => {
  let app: INestApplication;
  const clientService = { registerClient: jest.fn() };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ClientController],
      providers: [
        {
          provide: ClientService,
          useValue: clientService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/client/register (POST)', () => {
    const clientData = {
      document: '123456789',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
    };

    clientService.registerClient.mockResolvedValue(clientData);

    return request(app.getHttpServer())
      .post('/client/register')
      .send(clientData)
      .expect(201)
      .expect(clientData);
  });

  afterAll(async () => {
    await app.close();
  });
});
