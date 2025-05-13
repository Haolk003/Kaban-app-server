import { PrismaClient } from '@prisma/client';
import { CreateListDto, createListSchema } from './dto/create-list.dto';
import { z } from 'zod';

export class ListService {
  constructor(private readonly prisma: PrismaClient) {}

  async createList(data: CreateListDto, userId: string) {
    try {
      const validatedData = createListSchema.parse(data);

      const highestOrder = await this.prisma.list.findFirst({
        where: { boardId: validatedData.boardId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });

      const board = await this.prisma.board.findUnique({
        where: { id: validatedData.boardId },
        include: { member: true },
      });

      if (!board) {
        throw new Error('Board not found');
      }

      const newList = await this.prisma.$transaction(async (tx) => {
        return await tx.list.create({
          data: {
            name: validatedData.name,
            boardId: validatedData.boardId,
            order: (highestOrder?.order ?? -1) + 1,
            description: validatedData.description,
            color: validatedData?.color,
            icon: validatedData.icon,
            status: 'ACTIVE',
            createdBy: userId,
          },
        });
      });

      return {
        success: true,
        data: newList,
        message: 'Create list successfully',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map((e) => e.message).join(', ')}`,
        );
      } else if (error instanceof Error) {
        throw new Error(`Failed to create list: ${error.message}`);
      }

      throw new Error('An unexpected error occurred while creating the list');
    }
  }
}
