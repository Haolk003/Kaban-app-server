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

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    console.log(user);

    if (
      user &&
      user.password &&
      bcryptJs.compareSync(password, user.password)
    ) {
      console.log('a');
      return user;
    }
    return null;
  }

  async registerUser(registerDto: {
    name: string;
    email: string;
    password: string;
  }) {
    const { name, email, password } = registerDto;
    const userExist = await this.prisma.user.findUnique({ where: { email } });
    if (userExist) {
      throw new UnauthorizedException('Email is exist');
    }

    const code = Math.floor(Math.random() * 9000 + 1000);

    const token = this.jwtService.sign(
      {
        user: { name, email, password },
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
      variables: { name, activationCode: code },
    });

    return token;
  }

  async activateUser(token: string, code: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
      let password = '';
      const charcters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';

      for (let i = 0; i < 8; i++) {
        const index = Math.floor(Math.random() * charcters.length);
        password += charcters[index];
      }

      user = await this.prisma.user.create({
        data: {
          googleId: profile.id,
          email: profile.email,
          name: profile.lastName + profile.firstName,
          avatar: profile.picture,
          password: password,
        },
      });
    }
    return user;
  }

  async loginUser(email: string) {
    const userExist = await this.prisma.user.findUnique({ where: { email } });
  }
}
