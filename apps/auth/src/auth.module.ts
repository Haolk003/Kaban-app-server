import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthResolver } from './auth.resolver';
import { PrismaService } from 'y/prisma';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { GoogleStrategy } from './strategies/google.strategy';
import { LocalStrategy } from './strategies/local.trategy';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailModule, EmailService } from 'y/email';
import { GithubStrategy } from './strategies/github.strategy';
import { RabbitmqModule } from 'y/rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { CommonModule } from 'y/common';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from 'y/common/filters/global-exception.filter';

import { CloudinaryService, CloudinaryModule } from 'y/cloudinary';
import { HealthModule } from 'y/health';

@Module({
  imports: [
    HealthModule,
    CloudinaryModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 10000,
          limit: 500,
        },
      ],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // chỉ dùng cho môi trường dev
    }),
    EmailModule,
    RabbitmqModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      path: '/graphql',
      autoSchemaFile: {
        federation: 2,
      },
      sortSchema: true,
      playground: true,

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      context: ({ req, res }) => ({ req, res }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),

    CommonModule,
  ],
  controllers: [AuthController],
  providers: [
    EmailService,
    AuthService,
    AuthResolver,
    PrismaService,
    JwtService,
    GoogleStrategy,
    LocalStrategy,
    GithubStrategy,
    JwtStrategy,
    CloudinaryService,
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AuthModule {}
