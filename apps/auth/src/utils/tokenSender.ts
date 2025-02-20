import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';

export class TonkenSender {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtSerivice: JwtService,
  ) {}

  public sendToken(user: User) {
    const access_token = this.jwtSerivice.sign(
      {
        emai: user.email,
        sub: user.id,
      },
      {
        secret: this.configService.get<string>('ACCESS_TOKEN_KEY'),
        expiresIn: '15m',
      },
    );

    const refresh_token = this.jwtSerivice.sign(
      {
        sub: user.id,
        token_type: 'refresh',
      },
      {
        secret: this.configService.get<string>('REFRESH_TOKEN_KEY'),
        expiresIn: '30d',
      },
    );

    return { access_token, refresh_token };
  }
}
