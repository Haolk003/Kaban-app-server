import { Module } from '@nestjs/common';
import { TaskController } from './tasks/task.controller';
import { TaskService } from './tasks/task.service';
import { GraphQLModule } from '@nestjs/graphql';
import { CommonModule } from 'y/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'y/prisma';
import { TaskResolver } from './tasks/task.resolver';

import { LabelService } from './labels/label.service';
import { JwtService } from '@nestjs/jwt';
import { LabelModule } from './labels/label.module';
@Module({
  imports: [
    LabelModule,
    CommonModule,
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
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [TaskController],
  providers: [
    TaskService,
    PrismaService,
    TaskResolver,
    LabelService,
    JwtService,
  ],
})
export class TaskModule {}
