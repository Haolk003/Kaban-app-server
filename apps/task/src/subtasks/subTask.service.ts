import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'y/prisma';

@Injectable()
export class SubTaskService {
  private readonly logger = new Logger(SubTaskService.name);
  constructor(private readonly prisma: PrismaService) {}
}
