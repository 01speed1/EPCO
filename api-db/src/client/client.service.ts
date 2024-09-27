import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Client } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}

  async registerClient(data: {
    document: string;
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<Client> {
    const salt = await bcrypt.genSalt(3);
    data.password = await bcrypt.hash(data.password, salt);

    return this.prisma.client.create({
      data,
    });
  }

  async findOne(document: string, password?: string): Promise<Client | null> {
    const whereClause: any = { document };
    if (password) {
      whereClause.password = password;
    }

    return this.prisma.client.findUnique({
      where: whereClause,
    });
  }
}
