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
import { TokenType, CookieConfig, AuthError } from '../constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req, res }: { req: Request; res: Response } = ctx.getContext();

    try {
      const accessToken = this.extractToken(req, TokenType.ACCESS);
      const refreshToken = this.extractToken(req, TokenType.REFRESH);

      if (!accessToken && !refreshToken) {
        throw new UnauthorizedException(AuthError.LOGIN_REQUIRED);
      }

      if (accessToken) {
        await this.validateAccessToken(accessToken, req);
        return true;
      }

      if (refreshToken) {
        await this.handleRefreshToken(refreshToken, req, res);
        return true;
      }

      return false;
    } catch (error) {
      this.clearInvalidCookies(res);
      throw error;
    }
  }

  private async validateAccessToken(
    token: string,
    req: Request,
  ): Promise<void> {
    try {
      const payload: { sub: string } = this.jwtService.verify(token, {
        secret: this.config.get('ACCESS_TOKEN_KEY') as string,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          board: true,
        },
      });

      // if (!user) {
      //   throw new UnauthorizedException(AuthError.ACCOUNT_INACTIVE);
      // }

      if (!user) {
        throw new UnauthorizedException(AuthError.ACCOUNT_NOT_FOUND);
      }

      req.me = user;
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(AuthError.ACCESS_TOKEN_EXPIRED);
      }
      throw new UnauthorizedException(AuthError.INVALID_TOKEN);
    }
  }

  private async handleRefreshToken(
    token: string,
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const payload: { sub: string } = this.jwtService.verify(token, {
        secret: this.config.get('REFRESH_TOKEN_KEY'),
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      // if (payload.tokenType !== TokenType.REFRESH) {
      //   throw new UnauthorizedException(AuthError.INVALID_TOKEN_TYPE);
      // }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          board: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException(AuthError.ACCOUNT_NOT_FOUND);
      }

      // if (!user.) {
      //   throw new UnauthorizedException(AuthError.ACCOUNT_INACTIVE);
      // }

      this.issueNewTokens(user, res);
      req.me = user;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(AuthError.REFRESH_TOKEN_EXPIRED);
      }
      throw error;
    }
  }

  private issueNewTokens(
    user: { id: string; email: string },
    res: Response,
  ): void {
    const accessToken = this.generateToken(user, TokenType.ACCESS);
    const refreshToken = this.generateToken(user, TokenType.REFRESH);

    res.cookie(TokenType.ACCESS, accessToken, CookieConfig.ACCESS);
    res.cookie(TokenType.REFRESH, refreshToken, CookieConfig.REFRESH);
  }

  private generateToken(
    user: { id: string; email: string },
    type: TokenType,
  ): string {
    const config = {
      [TokenType.ACCESS]: {
        secret: this.config.get('ACCESS_TOKEN_KEY') as string,
        expiresIn: '15m',
      },
      [TokenType.REFRESH]: {
        secret: this.config.get('REFRESH_TOKEN_KEY') as string,
        expiresIn: '7d',
      },
    }[type];

    return this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        tokenType: type,
      },
      config,
    );
  }

  private extractToken(req: Request, type: TokenType): string | null {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return req.cookies[type]?.trim() || null;
  }

  private clearInvalidCookies(res: Response): void {
    res.clearCookie(TokenType.ACCESS, CookieConfig.ACCESS);
    res.clearCookie(TokenType.REFRESH, CookieConfig.REFRESH);
  }
}
