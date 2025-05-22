import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'y/prisma';
import { CreateTaskDto } from './dto/create-task.dto';
import { ErrorHandlerService } from 'y/common/service/error-hander.service';
import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterInput } from './dto/task-filter.dto';
import { PaginationInput } from './dto/pagination-filter.dto';
import { Priority } from 'y/common/enum/priority.enum';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  private readonly includeRelations = {
    list: {
      include: {
        board: {
          include: {
            member: true,
          },
        },
      },
    },
    labels: true,
    assigner: true,
    assignedTo: {
      include: {
        user: true,
      },
    },
    subTask: true,
  };
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async createTask(userId: string, input: CreateTaskDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const list = await tx.list.findUnique({
          where: { id: input.listId },
          include: { board: true },
        });

        if (!list) {
          throw new NotFoundException('List not found');
        }

        const isMember = await tx.boardMember.findFirst({
          where: {
            boardId: list.boardId,
            userId,
            role: { in: ['OWNER', 'MEMBER', 'ADMIN'] },
          },
        });

        if (!isMember) {
          throw new ForbiddenException(
            'You do not have permission to create task in this board',
          );
        }

        // Get max order in the list
        const maxOrder = await tx.task.aggregate({
          where: { listId: input.listId },
          _max: { orderId: true },
        });

        // Create a task with relations

        const { taskId, taskNumber } = await this.generateTaskId(
          tx,
          list.boardId,
        );
        const task = await tx.task.create({
          data: {
            ...input,
            orderId: (maxOrder._max.orderId || 0) + 1,
            assignerId: userId,
            labels: input.labelIds?.length
              ? { connect: input.labelIds.map((id) => ({ id })) }
              : undefined,
            assignedTo: input.assignedTo?.length
              ? { connect: input.assignedTo.map((id) => ({ id })) }
              : undefined,
            taskId: taskId,
            taskNumber: taskNumber,
            boardId: list.boardId,
            description: '',
            listId: input.listId,
            priority: (input?.priority as Priority) || 'medium',
            dueDate: input.dueDate,
          },
          include: this.includeRelations,
        });

        if (input.attachmentsInput && input.attachmentsInput.length > 0) {
          await tx.fileAttachment.createMany({
            data: input.attachmentsInput.map((attachment) => ({
              file_public_id: attachment.file_public_id,
              filePath: attachment.filePath,
              taskId: task.id,
              fileName: attachment.fileName,
              fileSize: attachment.fileSize,
              fileType: attachment.fileType,
              uploadedById: userId,
            })),
          });
        }

        this.logger.verbose(`Task created:${task.id}`);
        return task;
      });
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'TaskService.createTask');
    }
  }

  async updateTask(userId: string, taskId: string, input: UpdateTaskDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const existingTask = await tx.task.findUnique({
          where: { id: taskId },
        });

        if (!existingTask) {
          throw new NotFoundException('Task not found');
        }

        const isMember = await tx.boardMember.findFirst({
          where: {
            boardId: existingTask.boardId,
            userId,
            role: { in: ['OWNER', 'MEMBER', 'ADMIN'] },
          },
        });

        if (!isMember) {
          throw new ForbiddenException(
            'You do not have permission to create task in this board',
          );
        }

        const updatedTask = await tx.task.update({
          where: { id: taskId },
          data: {
            ...input,
            labels: input.labels?.length
              ? { connect: input.labels.map((id) => ({ id })) }
              : undefined,
            assignedTo: input.assignedTo?.length
              ? { connect: input.assignedTo.map((id) => ({ id })) }
              : undefined,
          },
        });
        this.logger.verbose(`Task updated: ${taskId}`);
        return updatedTask;
      });
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'TaskSerice.updateTask');
    }
  }

  async deleteTask(userId: string, taskId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const task = await tx.task.findUnique({
          where: { id: taskId },
        });

        if (!task) {
          throw new NotFoundException('Task not found');
        }

        const isOwner = await tx.boardMember.findUnique({
          where: { userId_boardId: { userId: userId, boardId: task.boardId } },
        });

        if (
          !isOwner ||
          !['OWNER', 'ADMIN'].some((value) => value === isOwner.role)
        ) {
          throw new ForbiddenException(
            'Only board owner & admin can delete tasks',
          );
        }
        await tx.task.delete({
          where: { id: taskId },
        });

        this.logger.verbose(`Task deleted:${taskId}`);
        return 'Task deleted successfully';
      });
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'TaskSerice.deleteTask');
    }
  }

  async getTasks(filter: TaskFilterInput, pagination: PaginationInput) {
    try {
      const where: Prisma.TaskWhereInput = this.buildWhereClause(filter);
      const orderBy: Prisma.TaskOrderByWithRelationInput =
        this.buildOrderByClause(filter);

      return await this.prisma.task.findMany({
        where,
        orderBy,
        // skip: pagination?.skip,
        take: pagination?.take,
        include: this.includeRelations,
      });
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'TaskSerice.getTasks');
    }
  }

  private buildWhereClause(filter: TaskFilterInput): Prisma.TaskWhereInput {
    return {
      AND: [
        filter.search
          ? {
              OR: [
                {
                  title: {
                    contains: filter.search.toLowerCase(),
                  },
                },
                {
                  description: {
                    contains: filter.search.toLowerCase(),
                  },
                },
              ],
            }
          : null,
        // filter.status
        //   ? { list: { status: filter.status } } // Lọc theo status từ List
        //   : null,
        filter.priority ? { priority: filter.priority } : null,
        filter.labels
          ? { labels: { some: { id: { in: filter.labels } } } }
          : null,
        filter.assignedTo
          ? {
              assignedTo: { some: { userId: { in: filter.assignedTo } } },
            }
          : null,
        filter.dueDate
          ? {
              dueDate: {
                lte: filter.dueDate?.end,
                gte: filter.dueDate?.start,
              },
            }
          : null,
      ].filter((filter) => filter !== null),
    };
  }

  private buildOrderByClause(
    filter: TaskFilterInput,
  ): Prisma.TaskOrderByWithRelationInput {
    const sortMapping: Record<string, Prisma.TaskOrderByWithRelationInput> = {
      CREATED_AT_ASC: { createdAt: 'asc' },
      CREATED_AT_DESC: { createdAt: 'desc' },
      DUE_DATE_ASC: { dueDate: 'asc' },
      DUE_DATE_DESC: { dueDate: 'desc' },
      PRIORITY_ASC: { priority: 'asc' },
      PRIORITY_DESC: { priority: 'desc' },
    };

    return sortMapping[filter.sortBy] || { createdAt: 'desc' };
  }

  private async generateTaskId(
    tx: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
    boardId: string,
  ) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });

    const maxTask = await this.prisma.task.aggregate({
      _max: { taskNumber: true },
      where: { boardId },
    });

    const nextTaskNumber: number = (Number(maxTask._max.taskNumber) || 0) + 1;

    return {
      taskId: `${board?.projectKey}-${nextTaskNumber}`,
      taskNumber: nextTaskNumber,
    };
  }
}
