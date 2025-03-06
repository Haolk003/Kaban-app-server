import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { CommonModule } from 'y/common';
import { GlobalExceptionFilter } from 'y/common/filters/global-exception.filter';
import { PrismaService } from 'y/prisma';
import { ListService } from './list.service';
import { ListResolver } from './list.resolver';

@Module({
  imports: [CommonModule],
  providers: [
    PrismaService,
    JwtService,
    ListService,
    ListResolver,
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
  exports: [ListService],
})
export class ListModule {}
