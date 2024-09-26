import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('MailService', () => {
  let service: MailService;
  let configService: ConfigService;
  let transporterMock;

  beforeEach(async () => {
    transporterMock = {
      sendMail: jest.fn().mockResolvedValue({ messageId: '12345' }),
    };
    (nodemailer.createTransport as jest.Mock).mockReturnValue(transporterMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'MAIL_HOST':
                  return 'smtp.example.com';
                case 'MAIL_PORT':
                  return 587;
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a transporter with correct config', () => {
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: null,
    });
  });

  it('should send an email', async () => {
    const to = 'test@example.com';
    const subject = 'Test Subject';
    const text = 'Test Text';

    await service.sendMail(to, subject, text);

    expect(transporterMock.sendMail).toHaveBeenCalledWith({
      from: '"NestJS App" <noreply@example.com>',
      to,
      subject,
      text,
    });
  });

  it('should log the message ID after sending an email', async () => {
    console.log = jest.fn();

    const to = 'test@example.com';
    const subject = 'Test Subject';
    const text = 'Test Text';

    await service.sendMail(to, subject, text);

    expect(console.log).toHaveBeenCalledWith('Message sent: %s', '12345');
  });
});