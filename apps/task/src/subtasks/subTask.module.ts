import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { CommonModule } from 'y/common';
import { GlobalExceptionFilter } from 'y/common/filters/global-exception.filter';
import { PrismaService } from 'y/prisma';
import { SubTaskService } from './subTask.service';
import { SubTaskResolver } from './subTask.resolver';

@Module({
  imports: [CommonModule],
  providers: [
    PrismaService,
    JwtService,
    SubTaskService,
    SubTaskResolver,
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
  exports: [SubTaskService],
})
export class SubTaskModule {}
