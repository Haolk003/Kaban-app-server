import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'y/prisma';

import { JwtService } from '@nestjs/jwt';

import * as bcryptJs from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'y/email';

import { User } from './entities/user.entity';

import { Response } from 'express';

import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }
  private sendToken(user: User) {
    const access_token = this.jwtService.sign(
      {
        emai: user.email,
        sub: user.id,
      },
      {
        secret: this.configService.get<string>('ACCESS_TOKEN_KEY'),
        expiresIn: '15m',
      },
    );

    const refresh_token = this.jwtService.sign(
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

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: { email, loginType: 'google' },
    });

    if (
      user &&
      user.password &&
      bcryptJs.compareSync(password, user.password)
    ) {
      return user;
    }
    return null;
  }

  async registerUser(registerDto: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const { firstName, lastName, email, password } = registerDto;
    const userExist = await this.prisma.user.findFirst({
      where: { email, loginType: 'email' },
    });

    if (userExist) {
      throw new UnauthorizedException('Email is exist');
    }

    const code = Math.floor(Math.random() * 9000 + 1000);

    const token = this.jwtService.sign(
      {
        user: { name: `${firstName} ${lastName}`, email, password },
        activationCode: code,
      },
      {
        expiresIn: '2h',
        secret: this.configService.get<string>('JWT_SECRECT'),
      },
    );

    await this.emailService.sendEmail({
      subject: 'Verify Email',
      template: 'activation-email.ejs',
      to: email,
      variables: { name: `${lastName} ${firstName}`, activationCode: code },
    });

    return token;
  }

  async activateUser(token: string, code: string) {
    const decoded: {
      user: { name: string; email: string; password: string };
      activationCode: number;
    } = this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_SECRECT'),
    });

    if (code !== String(decoded.activationCode)) {
      throw new BadRequestException('Activation Code is invalid');
    }

    const hashedPassword = bcryptJs.hashSync(decoded.user.password, 10);
    const newUser = await this.prisma.user.create({
      data: {
        name: decoded.user.name,
        email: decoded.user.email,
        password: hashedPassword,
      },
    });

    return newUser;
  }

  async validateGoogleUser(profile: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
  }) {
    let user = await this.prisma.user.findUnique({
      where: { googleId: profile.id },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          googleId: profile.id,
          email: profile.email,
          name: profile.lastName + profile.firstName,
          avatar: profile.picture,
          loginType: 'google',
        },
      });
    }
    return user;
  }

  async loginUser(email: string, res: Response) {
    const user = await this.prisma.user.findFirst({
      where: { email, loginType: 'email' },
    });

    if (!user) {
      throw new UnauthorizedException();
    }
    const { access_token, refresh_token } = this.sendToken(user);

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
    return { access_token, refresh_token };
  }

  private generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
  };

  private hashResetToken = async (token: string): Promise<string> => {
    const salt = await bcryptJs.genSalt(10);
    return bcryptJs.hash(token, salt);
  };

  async forgotPassword(email: string) {
    const userExist = await this.prisma.user.findFirstOrThrow({
      where: { email, loginType: 'email' },
    });

    if (!userExist) {
      throw new BadRequestException('User not found');
    }

    const resetToken = this.generateResetToken();
    const hashedToken = await this.hashResetToken(resetToken);

    const updatedUser = await this.prisma.user.updateMany({
      where: { email, loginType: 'email' },
      data: {
        password_reset_token_hash: hashedToken,
        password_reset_expires_at: new Date(Date.now() + 3600000),
      },
    });

    await this.emailService.sendEmail({
      subject: 'Password Reset Request',
      to: email,
      template: 'forgot-password.ejs',
      variables: {
        name: userExist.name,
        link: `http://localhost:3000/reset-password/${resetToken}`,
      },
    });

    return updatedUser;
  }

  async resetPassword(
    email: string,
    token: string,
    newPassword: string,
  ): Promise<string> {
    const user = await this.prisma.user.findFirst({
      where: { email, loginType: 'email' },
    });
    if (
      !user ||
      !user.password_reset_token_hash ||
      !user.password_reset_expires_at
    ) {
      throw new BadRequestException('Invalid or expired token');
    }

    const isTokenValid = await bcryptJs.compare(
      token,
      user.password_reset_token_hash,
    );

    if (!isTokenValid || user.password_reset_expires_at < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    const hashedPassword = await bcryptJs.hash(newPassword, 10);

    await this.prisma.user.updateMany({
      where: { email, loginType: 'email' },
      data: { password: hashedPassword },
    });
    return 'Password is updated';
  }

  async findOrCreateUser(profile: {
    id: string;
    username: string;
    emails: { value: string }[];
    photos: { value: string }[];
  }) {
    const user = await this.prisma.user.upsert({
      where: { githubId: profile.id },
      update: {
        name: profile.username,
        email: profile.emails?.[0]?.value,
        avatar: profile.photos?.[0]?.value,
      },
      create: {
        githubId: profile.id,
        name: profile.username,
        email: profile.emails?.[0]?.value,
        avatar: profile.photos?.[0]?.value,
      },
    });
    return user;
  }
}
