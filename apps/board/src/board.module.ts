import { Module } from '@nestjs/common';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';

import { Request, Response } from 'express';
import { BoardResolver } from './board.resolver';
import { CommonModule } from 'y/common';
import { PrismaService } from 'y/prisma';
import { JwtService } from '@nestjs/jwt';
import { EmailModule, EmailService } from 'y/email';
import { ListService } from './list/list.service';

import { ListModule } from './list/list.module';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from 'y/common/filters/global-exception.filter';

@Module({
  imports: [
    CommonModule,
    ListModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // chỉ dùng cho môi trường dev
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      autoSchemaFile: {
        federation: 2,
      },
      driver: ApolloFederationDriver,
      playground: true,
      introspection: true,
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
    }),
    EmailModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [BoardController],
  providers: [
    ListService,
    BoardService,
    BoardResolver,
    PrismaService,
    JwtService,
    EmailService,
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class BoardModule {}
