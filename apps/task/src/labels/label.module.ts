import { Module } from '@nestjs/common';
import { LabelService } from './label.service';
import { PrismaService } from 'y/prisma';
import { LabelResolver } from './label.resolver';
import { JwtService } from '@nestjs/jwt';
import { CommonModule } from 'y/common';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from 'y/common/filters/global-exception.filter';

@Module({
  imports: [CommonModule],
  providers: [
    LabelResolver,
    LabelService,
    PrismaService,
    JwtService,
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
  exports: [LabelService], // Xuất service để module khác có thể dùng
})
export class LabelModule {}
