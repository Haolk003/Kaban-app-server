import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'y/prisma';
import { CreateLabelDto } from './dto/create-label.dto';

import { UpdateLabelDto } from './dto/update-label.dto';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class LabelService {
  private readonly logger = new Logger(LabelService.name);
  constructor(private readonly prisma: PrismaService) {}

  async createLabel(createLabelDto: CreateLabelDto, userId: string) {
    const { boardId, name } = createLabelDto;
    try {
      return await this.prisma.$transaction(async (tx) => {
        const existingLabel = await tx.label.findUnique({
          where: { name_boardId: { name, boardId } },
        });

        if (existingLabel) {
          throw new BadRequestException('Label name already exists');
        }

        await this.checkBoardPermission(tx, userId, boardId);
        const label = await tx.label.create({ data: { name, boardId } });

        this.logger.log(`Label created: ${label.id}`);
        return label;
      });
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Failed to create label:${error.message}`);
      throw error;
    }
  }

  async updateLabel(
    labelId: string,
    updateLabelDto: UpdateLabelDto,
    userId: string,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const existingLabel = await tx.label.findUnique({
          where: { id: labelId },
        });

        if (!existingLabel) {
          throw new NotFoundException('Label not found');
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await this.checkBoardPermission(tx, userId, existingLabel.boardId);

        const updatedLabel = await tx.label.update({
          where: { id: labelId },
          data: { name: updateLabelDto.name },
        });
        this.logger.log(`Label updated: ${updatedLabel.id}`);
        return updatedLabel;
      });
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Failed to update label:${error.message}`);
      throw error;
    }
  }

  async deleteLabel(labelId: string, userId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const label = await tx.label.findUnique({
          where: { id: labelId },
        });

        if (!label) {
          throw new NotFoundException('Label not found');
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await this.checkBoardPermission(tx, userId, label.boardId);

        const tasksWithLabel = await tx.task.findMany({
          where: {
            labels: { some: { id: labelId } },
          },
          take: 1,
        });
        if (tasksWithLabel.length > 0) {
          throw new BadRequestException(
            'Cannot delete label assigned to tasks',
          );
        }
        const deletedLabel = await tx.label.delete({
          where: { id: labelId },
        });
        this.logger.log(`Label deleted: ${deletedLabel.id}`);
        return deletedLabel;
      });
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Failed to delete label:${error.message}`);
      throw error;
    }
  }

  private async checkBoardPermission(
    tx: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
    userId: string,
    boardId: string,
  ) {
    const board = await tx.board.findUnique({
      where: { id: boardId },
      include: { member: true },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const isMember = board.member.find((member) => member.userId === userId);
    if (!isMember) {
      throw new ForbiddenException(
        'You do not have permission to modify labels in this board',
      );
    }

    if (isMember.role === 'VIEWER') {
      throw new ForbiddenException('Viewer are not allowed to modify labels');
    }
  }
}
