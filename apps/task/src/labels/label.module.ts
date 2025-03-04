import { Module } from '@nestjs/common';
import { LabelService } from './label.service';
import { PrismaService } from 'y/prisma';
import { LabelResolver } from './label.resolver';
import { JwtService } from '@nestjs/jwt';
import { CommonModule } from 'y/common';

@Module({
  imports: [CommonModule],
  providers: [LabelResolver, LabelService, PrismaService, JwtService],
  exports: [LabelService], // Xuất service để module khác có thể dùng
})
export class LabelModule {}
