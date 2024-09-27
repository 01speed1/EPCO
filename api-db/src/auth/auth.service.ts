import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientService } from '../client/client.service';
import * as bcrypt from 'bcryptjs';
import { Client } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly clientService: ClientService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(document: string, password: string): Promise<any> {
    const client = await this.clientService.findOne(document);

    if (!client) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, client.password);

    if (client && isValidPassword) {
      delete client.password;
      return client;
    }
    return null;
  }

  async login(client: Client): Promise<{ accessToken: string }> {
    const payload = { document: client.document, phone: client.phone };
    const validUser = await this.validateUser(client.document, client.password);

    if (!validUser) {
      throw new Error('Invalid credentials');
    }

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
