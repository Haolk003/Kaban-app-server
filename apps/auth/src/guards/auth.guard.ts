import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from 'y/prisma';
import { Request, Response } from 'express';

import { isEmpty } from 'class-validator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const { req, res }: { req: Request; res: Response } =
      gqlContext.getContext();

    const accessToken = this.getTokenFromCookie(req, 'accessToken') as string;

    const refreshToken = this.getTokenFromCookie(req, 'refreshToken') as string;

    if (!accessToken && !refreshToken) {
      throw new UnauthorizedException('Please login to access this resouce');
    }
    try {
      if (accessToken && !isEmpty(accessToken)) {
        const decoded: { sub: string; email: string; exp: number } =
          this.jwtService.verify(accessToken, {
            secret: this.config.get<string>('ACCESS_TOKEN_KEY'),
          });
        console.log(decoded);

        const user = await this.prisma.user.findUnique({
          where: {
            id: decoded.sub,
          },
        });
        req.me = user;
        return true;
      }
      await this.updateAccessToken(req, res);
      return true;
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.name === 'TokenExpiredError') {
        // await this.updateAccessToken(req, res);
        return true;
      }

      throw new UnauthorizedException('Invalid or expried access token');
    }
  }

  private getTokenFromCookie(req: Request, tokenName: string): string | null {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const cookies = req.cookies;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return cookies[tokenName] || null;
  }

  private async updateAccessToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = this.getTokenFromCookie(
        req,
        'refreshToken',
      ) as string;

      if (!refreshToken) {
        throw new UnauthorizedException(
          'Refresh token expired, please login agains',
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decodedRefreshToken: {
        sub: string;

        iat: number;
        exp: number;
      } = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('REFRESH_TOKEN_KEY'),
      });

      if (decodedRefreshToken.exp * 1000 < Date.now()) {
        throw new UnauthorizedException(
          'Refresh token expired, please login agains',
        );
      }

      const user = await this.prisma.user.findUnique({
        where: {
          id: decodedRefreshToken.sub,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const access_token = this.jwtService.sign(
        {
          emai: user.email,
          sub: user.id,
        },
        {
          secret: this.config.get<string>('ACCESS_TOKEN_KEY'),
          expiresIn: '15m',
        },
      );

      const refresh_token = this.jwtService.sign(
        {
          sub: user.id,
          token_type: 'refresh',
        },
        {
          secret: this.config.get<string>('REFRESH_TOKEN_KEY'),
          expiresIn: '30d',
        },
      );

      res.cookie('accessToken', access_token, {
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 5,
        expires: new Date(Date.now() + 1000 * 60 * 5),
      });

      res.cookie('refreshToken', refresh_token, {
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });
      req.me = user;
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new UnauthorizedException(error.message);
    }
  }
}
