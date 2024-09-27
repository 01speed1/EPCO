import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientModule } from '../client/client.module';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { ClientService } from '../client/client.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';

import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ClientModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    AuthService,
    ClientService,
    JwtStrategy,
    PrismaService,
    WalletService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
