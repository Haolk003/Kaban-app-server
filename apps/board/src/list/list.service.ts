import { ErrorHandlerService } from 'y/common/service/error-hander.service';
import { PrismaService } from 'y/prisma';
import { CreateListDto } from './dto/create-list.dto';
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateListDto } from './dto/update-list.dto';

@Injectable()
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

        // get max order in the board
        const maxOrder = await tx.task.aggregate({
          where: { boardId: input.boardId },
          _max: { orderId: true },
        });

        // create list

        const list = await tx.list.create({
          data: {
            name: input.name,
            order: (maxOrder._max.orderId || 0) + 1,
            status: input.status ? input.status : input.name,
            boardId: input.boardId,
          },
        });

        this.logger.verbose(`List created:${list.id}`);

        return list;
      });
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'ListService.createList');
    }
  }

  async updateList(listId: string, input: UpdateListDto, userId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const listExist = await tx.list.findUnique({ where: { id: listId } });
        if (!listExist) {
          throw new NotFoundException('List not found');
        }

        const isAdmin = await tx.boardMember.findUnique({
          where: {
            userId_boardId: { userId: userId, boardId: listExist.boardId },
            role: { in: ['OWNER', 'ADMIN'] },
          },
        });

        if (!isAdmin) {
          throw new ForbiddenException(
            'You do not have permission to create lis in this board',
          );
        }

        const checkNameListExist = await tx.list.findFirst({
          where: { boardId: listExist.boardId, name: input.name },
        });

        if (checkNameListExist) {
          throw new ForbiddenException('Name is duplicated');
        }

        const updatedList = await tx.list.update({
          where: { id: listId },
          data: {
            ...input,
          },
        });
        this.logger.verbose(`List updated:${updatedList.id}`);
        return updatedList;
      });
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'ListSerivce.updateList');
    }
  }

  async deleteList(listId: string, userId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const list = await tx.list.findUnique({ where: { id: listId } });

        if (!list) {
          throw new NotFoundException('List not found');
        }

        const isAdmin = await tx.boardMember.findUnique({
          where: {
            userId_boardId: { userId: userId, boardId: list.boardId },
            role: { in: ['OWNER', 'ADMIN'] },
          },
        });

        if (!isAdmin) {
          throw new ForbiddenException(
            'You do not have permission to create lis in this board',
          );
        }

        await tx.list.delete({
          where: { id: listId },
        });
        this.logger.verbose(`List deleted:${listId}`);
        return 'Task deleted sucessfully';
      });
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'ListService.deleteList');
    }
  }
}
