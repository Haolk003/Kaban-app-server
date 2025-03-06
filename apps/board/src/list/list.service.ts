import { ObjectType } from '@nestjs/graphql';
import { ErrorHandlerService } from 'y/common/service/error-hander.service';
import { PrismaService } from 'y/prisma';
import { CreateListDto } from './dto/create-list.dto';
import { ForbiddenException, Logger, NotFoundException } from '@nestjs/common';

@ObjectType()
export class ListService {
  private readonly logger = new Logger(ListService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async createList(userId: string, input: CreateListDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const board = await tx.board.findUnique({
          where: { id: input.boardId },
        });

        if (!board) {
          throw new NotFoundException('Board not found');
        }

        const isMember = await tx.boardMember.findUnique({
          where: {
            userId_boardId: { userId: userId, boardId: input.boardId },
            role: { in: ['OWNER', 'ADMIN'] },
          },
        });

        if (!isMember) {
          throw new ForbiddenException(
            'You do not have permission to create lis in this board',
          );
        }
      });
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'ListService.createList');
    }
  }
}
