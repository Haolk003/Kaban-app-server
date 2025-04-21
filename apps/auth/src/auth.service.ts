import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'y/prisma';

import { JwtService } from '@nestjs/jwt';

import * as bcryptJs from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'y/email';

import { Response } from 'express';

import * as crypto from 'crypto';
import { ErrorHandlerService } from 'y/common/service/error-hander.service';
import { UpdateProfileDto } from './dto/user.dto';
import { CookieConfig, TokenType } from 'y/common/constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private readonly errorHander: ErrorHandlerService,
  ) {}

  private sendToken(user: { email: string; id: string }) {
    const access_token = this.jwtService.sign(
      {
        email: user.email,
        sub: user.id,
        tokenType: 'accessToken',
      },
      {
        secret: this.configService.get<string>('ACCESS_TOKEN_KEY'),
        expiresIn: '15m',
      },
    );

    const refresh_token = this.jwtService.sign(
      {
        sub: user.id,
        token_type: 'refreshToken',
      },
      {
        secret: this.configService.get<string>('REFRESH_TOKEN_KEY'),
        expiresIn: '7d',
      },
    );

    return { access_token, refresh_token };
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          account: true,
        },
      });

      if (!user) {
        return null;
      }

      const account = await this.prisma.account.findMany({
        where: {
          userId: user.id,
          provider: 'email',
        },
      });

      if (
        account &&
        account.length > 0 &&
        account[0].passwordHash &&
        bcryptJs.compareSync(password, account[0].passwordHash)
      ) {
        return user;
      }
      return null;
    } catch (error) {
      this.errorHander.handleError(error as Error, 'AuthService.validateUser');
    }
  }

  async registerUser(registerDto: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    try {
      const { firstName, lastName, email, password } = registerDto;
      const userExist = await this.prisma.user.findUnique({
        where: { email },
      });

      if (userExist && userExist.isVerified) {
        throw new UnauthorizedException('Email is exist');
      }

      const code = Math.floor(Math.random() * 9000 + 1000);

      const token = this.jwtService.sign(
        {
          user: { name: `${firstName} ${lastName}`, email },
        },
        {
          expiresIn: '2h',
          secret: this.configService.get<string>('JWT_SECRECT'),
        },
      );
      const hashedPassword = bcryptJs.hashSync(password, 10);
      if (userExist) {
        await this.prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { email },
            data: {
              name: `${firstName} ${lastName}`,
              verification_token: token,
              activation_code: String(code),
              verification_token_expires_at: new Date(Date.now() + 600000),
            },
          });

          await this.prisma.account.upsert({
            where: {
              provider_userId: { provider: 'email', userId: userExist.id },
            },
            create: {
              provider: 'email',
              passwordHash: hashedPassword,
              userId: userExist.id,
            },
            update: {},
          });
        });
      } else {
        await this.prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              email,
              name: `${firstName} ${lastName}`,
              verification_token: token,
              activation_code: String(code),
              verification_token_expires_at: new Date(Date.now() + 600000),
            },
          });

          await tx.account.create({
            data: {
              provider: 'email',
              passwordHash: hashedPassword,
              userId: user.id,
            },
          });
        });
      }

      await this.emailService.sendEmail({
        subject: 'Verify Email',
        template: 'activation-email.ejs',
        to: email,
        variables: { name: `${lastName} ${firstName}`, activationCode: code },
      });

      this.logger.log(`User created: ${email}`);
      return token;
    } catch (error) {
      this.errorHander.handleError(error as Error, 'AuthService.register');
    }
  }

  async activateUser(token: string, code: string) {
    try {
      const decoded: {
        user: { name: string; email: string };
      } = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRECT'),
      });

      const userExist = await this.prisma.user.findUnique({
        where: {
          email: decoded.user.email,
          isVerified: false,
        },
      });

      if (!userExist) {
        throw new BadRequestException('User not found');
      }

      if (code !== String(userExist.activation_code)) {
        throw new BadRequestException('Activation Code is invalid');
      }

      if (
        !userExist.verification_token_expires_at ||
        userExist.verification_token_expires_at < new Date() ||
        !userExist.verification_token ||
        userExist.verification_token !== token
      ) {
        throw new BadRequestException('Token is expired');
      }

      const user = await this.prisma.user.update({
        where: { id: userExist.id },
        data: {
          isVerified: true,
          verification_token: null,
          verification_token_expires_at: null,
          activation_code: null,
        },
      });

      this.logger.log(`User activated: ${user.id}`);
      return user;
    } catch (error) {
      this.errorHander.handleError(error as Error, 'AuthService.activateUser');
    }
  }

  async validateGoogleUser(
    profile: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      picture: string;
    },
    res: Response,
  ) {
    try {
      let user = await this.prisma.user.findUnique({
        where: { email: profile.email },
      });

      if (!user) {
        user = await this.prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              email: profile.email,
              name: profile.lastName + profile.firstName,
              avatar: { public_id: null, url: profile.picture },
            },
          });

          await tx.account.create({
            data: {
              provider: 'google',
              providerId: profile.id,
              userId: newUser.id,
            },
          });
          this.logger.log(`Google login successs: ${newUser.id}`);
          return newUser;
        });
      } else {
        await this.prisma.account.upsert({
          where: {
            provider_userId: { provider: 'google', userId: user.id },
          },
          create: {
            provider: 'google',
            providerId: profile.id,
            userId: user.id,
          },
          update: { providerId: profile.id },
        });
      }

      const { access_token, refresh_token } = this.sendToken(user);
      res.cookie('accessToken', access_token, {
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        domain: 'localhost',
        maxAge: 1000 * 60 * 5,
        expires: new Date(Date.now() + 1000 * 60 * 5),
      });

      res.cookie('refreshToken', refresh_token, {
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        domain: 'localhost',
        maxAge: 1000 * 60 * 60 * 24,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });

      this.logger.log(`Google login successs: ${user.id}`);
      return user;
    } catch (error) {
      this.errorHander.handleError(error as Error, 'AuthService.loginGoogle');
    }
  }

  async validateGithub(
    profile: {
      id: string;
      email: string;
      name: string;
      picture: string;
    },
    res: Response,
  ) {
    try {
      const { email, name, id, picture } = profile;
      let user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        user = await this.prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              email,
              name,
              avatar: picture,
            },
          });

          await tx.account.create({
            data: {
              provider: 'github',
              providerId: id,
              userId: newUser.id,
            },
          });
          this.logger.log(`Github login successs: ${newUser.id}`);
          return newUser;
        });
      } else {
        await this.prisma.account.upsert({
          where: {
            provider_userId: { provider: 'github', userId: user.id },
          },
          create: {
            provider: 'github',
            providerId: id,
            userId: user.id,
          },
          update: { providerId: id },
        });
      }

      const { access_token, refresh_token } = this.sendToken(user);

      res.cookie('accessToken', access_token, {
        secure: false,
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 5,
        domain: 'localhost',
        expires: new Date(Date.now() + 1000 * 60 * 5),
      });

      res.cookie('refreshToken', refresh_token, {
        secure: false,
        httpOnly: true,
        sameSite: 'strict',
        domain: 'localhost',
        maxAge: 1000 * 60 * 60 * 24,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });

      this.logger.log(`Github  login successs: ${user.id}`);
      return user;
    } catch (error) {
      this.errorHander.handleError(
        error as Error,
        'AuthService.validateGithub',
      );
    }
  }

  async loginUser(email: string, res: Response) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email, isVerified: true },
      });

      if (!user) {
        throw new UnauthorizedException();
      }
      const { access_token, refresh_token } = this.sendToken({
        email: user.email,
        id: user.id,
      });

      res.cookie(TokenType.ACCESS, access_token, CookieConfig.ACCESS);

      res.cookie(TokenType.REFRESH, refresh_token, CookieConfig.REFRESH);

      this.logger.log(`login successs: ${user.id}`);
      return { access_token, refresh_token };
    } catch (error) {
      this.errorHander.handleError(error as Error, 'AuthService.loginUser');
    }
  }

  private generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
  };

  private hashResetToken = async (token: string): Promise<string> => {
    const salt = await bcryptJs.genSalt(10);
    return bcryptJs.hash(token, salt);
  };

  async forgotPassword(email: string) {
    try {
      const userExist = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!userExist) {
        throw new BadRequestException('User not found');
      }

      const resetToken = this.generateResetToken();
      const hashedToken = await this.hashResetToken(resetToken);

      const updatedUser = await this.prisma.user.update({
        where: { email },
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
          link: `http://localhost:3000/reset-password?token=${resetToken}&email=${email}`,
        },
      });

      this.logger.log(`Send Email Forgot Password: ${userExist.id}`);
      return updatedUser;
    } catch (error) {
      this.errorHander.handleError(
        error as Error,
        'AuthService.forgotPassword',
      );
    }
  }

  async resetPassword(
    email: string,
    token: string,
    newPassword: string,
  ): Promise<string> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
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

      await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { email },
          data: { password_reset_token_hash: null },
        });

        await tx.account.updateMany({
          where: {
            provider: 'email',
            userId: user.id,
          },
          data: {
            passwordHash: hashedPassword,
          },
        });
      });
      this.logger.log(`Password is updated for user: ${user.id}`);
      return 'Password is updated';
    } catch (error) {
      this.errorHander.handleError(error as Error, 'AuthService.resetPassword');
    }
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    try {
      const findUserAndUpdate = await this.prisma.user.update({
        where: { id: userId },
        data: {
          name: updateProfileDto.name,
          bio: updateProfileDto.bio,
          avatar: updateProfileDto.avatar
            ? { ...updateProfileDto.avatar }
            : undefined,
          jobName: updateProfileDto.jobName,
          location: updateProfileDto.location,
        },
      });

      return findUserAndUpdate;
    } catch (error) {
      this.errorHander.handleError(error as Error, 'AuthService.updateProfile');
    }
  }

  async findUserByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      return user;
    } catch (error) {
      this.errorHander.handleError(
        error as Error,
        'AuthService.findUserByEmail',
      );
    }
  }

  // async findOrCreateUser(profile: {
  //   id: string;
  //   username: string;
  //   emails: { value: string }[];
  //   photos: { value: string }[];
  // }) {
  //   const user = await this.prisma.user.upsert({
  //     where: { githubId: profile.id },
  //     update: {
  //       name: profile.username,
  //       email: profile.emails?.[0]?.value,
  //       avatar: profile.photos?.[0]?.value,
  //     },
  //     create: {
  //       githubId: profile.id,
  //       name: profile.username,
  //       email: profile.emails?.[0]?.value,
  //       avatar: profile.photos?.[0]?.value,
  //     },
  //   });
  //   return user;
  // }
}
