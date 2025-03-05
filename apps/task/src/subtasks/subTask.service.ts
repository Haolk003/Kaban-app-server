import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ErrorHandlerService } from 'y/common/service/error-hander.service';
import { PrismaService } from 'y/prisma';
import { CreateSubTaskDto } from './dto/create-subtask.dto';
import { UpdateSubTaskDto } from './dto/update-subtask.dto';

@Injectable()
export class SubTaskService {
  private readonly logger = new Logger(SubTaskService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async createSubTask(createSubtaskDto: CreateSubTaskDto, userId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const parentTask = await tx.task.findUnique({
          where: {
            id: createSubtaskDto.taskId,
          },
        });
        if (!parentTask) {
          throw new NotFoundException('Parent task not found');
        }

        const checkMember = await tx.boardMember.findUnique({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          where: { userId_boardId: { userId, boardId: parentTask.boardId } },
        });

        if (!checkMember || checkMember.role === 'VIEWER') {
          throw new ForbiddenException(
            'You do not have permission to create subtsk in this board',
          );
        }

        const subtask = await tx.subtask.create({
          data: {
            title: createSubtaskDto.title,
            description: createSubtaskDto.description,
            taskId: createSubtaskDto.taskId,
          },
          include: { task: true },
        });

        this.logger.verbose(`Subtask created: ${subtask.id}`);
        return subtask;
      });
    } catch (error) {
      this.errorHandler.handleError(
        error as Error,
        'SubTaskService.createSubTask',
      );
    }
  }

  async updateSubTask(
    subTaskId: string,
    updateSubTaskDto: UpdateSubTaskDto,
    userId: string,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const subtask = await tx.subtask.findUnique({
          where: { id: subTaskId },
          include: { task: true },
        });

        if (!subtask) {
          throw new NotFoundException('SubTask not found');
        }

        const checkMember = await tx.boardMember.findUnique({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          where: { userId_boardId: { userId, boardId: subtask.task.boardId } },
        });

        if (!checkMember || checkMember.role === 'VIEWER') {
          throw new ForbiddenException(
            'You do not have permission to create subtsk in this board',
          );
        }

        const updatedSubTask = await tx.subtask.update({
          where: { id: subTaskId },
          data: { ...updateSubTaskDto },
        });

        this.logger.log(`Subtask updated: ${updatedSubTask.id}`);
        return updatedSubTask;
      });
    } catch (error) {
      this.errorHandler.handleError(
        error as Error,
        'SubTaskService.updateSubtask',
      );
    }
  }

  async deleteSubTask(subTaskId: string, userId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const subtask = await tx.subtask.findUnique({
          where: { id: subTaskId },
          include: { task: true },
        });

        if (!subtask) {
          throw new NotFoundException('Subtask not found');
        }

        const checkMember = await tx.boardMember.findUnique({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          where: { userId_boardId: { userId, boardId: subtask.task.boardId } },
        });

        if (!checkMember || checkMember.role === 'VIEWER') {
          throw new ForbiddenException(
            'You do not have permission to create subtsk in this board',
          );
        }

        const deletedSubtask = await tx.subtask.delete({
          where: { id: subTaskId },
        });
        this.logger.log(`Subtask deleted: ${deletedSubtask.id}`);
        return `Subtask deleted: ${deletedSubtask.id}`;
      });
    } catch (error) {
      this.errorHandler.handleError(
        error as Error,
        'SubTaskService.deleteSubTask',
      );
    }
  }
}
