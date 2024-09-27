import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ClientService } from '../client/client.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Client } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let clientService: ClientService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ClientService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    clientService = module.get<ClientService>(ClientService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return client without password if credentials are valid', async () => {
      const client = { document: '123', password: 'hashedPassword' } as Client;
      jest.spyOn(clientService, 'findOne').mockResolvedValue(client);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await service.validateUser('123', 'password');

      expect(result).toEqual({ document: '123' });
    });

    it('should return null if credentials are invalid', async () => {
      const client = { document: '123', password: 'hashedPassword' } as Client;
      jest.spyOn(clientService, 'findOne').mockResolvedValue(client);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const result = await service.validateUser('123', 'password');

      expect(result).toBeNull();
    });

    it('should return null if client is not found', async () => {
      jest.spyOn(clientService, 'findOne').mockResolvedValue(null);

      const result = await service.validateUser('123', 'password');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return accessToken if credentials are valid', async () => {
      const client = {
        document: '123',
        password: 'password',
        phone: '555-5555',
      } as Client;
      const validClient = { document: '123', phone: '555-5555' };
      jest.spyOn(service, 'validateUser').mockResolvedValue(validClient);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');

      const result = await service.login(client);

      expect(result).toEqual({ accessToken: 'token' });
    });

    it('should throw an error if credentials are invalid', async () => {
      const client = { document: '123', password: 'password' } as Client;
      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      await expect(service.login(client)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });
});
