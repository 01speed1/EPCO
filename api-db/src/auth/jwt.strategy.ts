import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ClientService } from '../client/client.service';
import { WalletService } from '../wallet/wallet.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly clientService: ClientService,
    private readonly walletService: WalletService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const { document } = await this.clientService.findOne(payload.document);

    if (!document || !payload.wallet) {
      payload.wallet = await this.walletService.findByClientDocument(document);
      throw new UnauthorizedException();
    }
    return { clientDocument: payload.document, wallet: payload.wallet };
  }
}
