import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Client } from '@prisma/client';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}

  async registerClient(data: {
    document: string;
    name: string;
    email: string;
    phone: string;
  }): Promise<Client> {
    return this.prisma.client.create({
      data,
    });
  }
}
