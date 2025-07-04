import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'y/prisma';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { AddMemberDto } from './dto/add-member-board.dto';
import { EmailService } from 'y/email';

import { generateProjectKey } from './utils/project-key.generator';
import { $Enums } from '@prisma/client';

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}


  getHello(): string {
    return 'Hello World!';
  }

  // utils/color.ts
  generateBoardColor = (): string => {
    const PRESET_COLORS = [
      '#3b82f6', // Blue
      '#10b981', // Green
      '#f59e0b', // Amber
      '#ec4899', // Pink
      '#8b5cf6', // Purple
      '#ef4444', // Red
      '#06b6d4', // Cyan
      '#84cc16', // Lime
      '#f97316', // Orange
      '#64748b', // Slate
    ];

    return PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
  };

  async createBoard(createBoardDto: CreateBoardDto, ownerId: string) {

    try {
      return await this.prisma.$transaction(async (tx) => {
        const owner = await tx.user.findUnique({
          where: { id: ownerId },
        });

        if (!owner) {
          throw new NotFoundException('User not found');
        }
        const projectKey = await generateProjectKey(
          tx,
          createBoardDto.title,
          owner.id,
        );
        const board = await tx.board.create({
          data: {
            title: createBoardDto.title,
            description: createBoardDto.description || '',
            ownerId: ownerId,
            projectKey: projectKey,
            color: this.generateBoardColor(),
            member: {
              create: {
                userId: ownerId,
                role: 'OWNER',
              },
            },
          },
          include: {
            member: true,
            list: true,
            owner: true,
          },
        });

        const defaultList = ['To Do', 'In Progress', 'Done'];

        await tx.list.createMany({
          data: defaultList.map((name, index) => ({
            name,
            order: index + 1,
            boardId: board.id,
            createdBy: 'owner',
          })),
        });

        this.logger.log(`Board created: ${board.id}`);
        return board;
      });
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'BoardService.createBoard');
    }
  }

  async getBoardsByUserId(userId: string) {
    try {
      const userWithBoard = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          boardMembers: {
            include: {
              board: {
                include: {
                  _count: {
                    select: {
                      tasks: true,
                      member: true,
                    },
                  },
                  tasks: {
                    select: {
                      id: true,
                      subTask: {
                        select: {
                          id: true,
                          isCompleted: true,
                        },
                      },
                    },
                  },
                },
              },
            },
            orderBy: {
              lastAccessed: 'desc',
            },
          },
        },
      });

      if (!userWithBoard) return [];

      return userWithBoard.boardMembers.map((boardMember) => {
        const completedTasks = boardMember.board.tasks.reduce((acc, task) => {
          return (
            acc + (task.subTask.every((subTask) => subTask.isCompleted) ? 1 : 0)
          );
        }, 0);

        const isOwner = boardMember.board.ownerId === userId;

        return {
          id: boardMember.board.id,
          title: boardMember.board.title,
          description: boardMember.board.description,
          projectKey: boardMember.board.projectKey,
          color: boardMember?.board?.color || '#3b82f6',
          createdAt: boardMember.board.createdAt,
          updatedAt: boardMember.board.updatedAt,
          tasksCount: {
            total: boardMember.board._count.tasks || 0,
            completed: completedTasks,
          },
          membersCount: boardMember.board._count.member,
          role: boardMember.role,
          status: boardMember.board.status,
          isOwner,
        };
      });
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Failed to get boards: ${error.message}`);
      throw error;
    }
  }

  async getBoardById(boardId: string, userId: string) {
    try {
      const board = await this.prisma.board.findUnique({
        where: { id: boardId, ownerId: userId },
        include: {
          member: true,
          list: {
            include: {
              tasks: true,
            },
          },
        },
      });
      if (!board) {
        throw new NotFoundException('Board not found');
      }
      return board;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      this.logger.error(`Failed to get board: ${errorMessage}`);

      throw error;
    }
  }

  async getBoardDetailsWithTasks(boardId: string, userId: string) {
    try {
      const board = await this.prisma.board.findUnique({
        where: { id: boardId, ownerId: userId },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },

          list: {
            orderBy: {
              order: 'asc',
            },
            include: {
              tasks: {
                orderBy: { orderId: 'asc' },
                include: {
                  subTask: {
                    orderBy: { createdAt: 'asc' },
                    select: {
                      id: true,
                      title: true,
                      isCompleted: true,
                    },
                  },
                  assigner: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      avatar: true,
                    },
                  },
                  labels: true,
                  assignedTo: {
                    include: {
                      user: {
                        select: {
                          id: true,
                          name: true,
                          avatar: true,
                        },
                      },
                    },
                  },
                  _count: {
                    select: {
                      subTask: true,
                      likes: true,
                      discussion: true,
                    },
                  },
                },
              },
            },
          },
          member: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
          labels: true,
          _count: {
            select: {
              tasks: true,
              member: true,
              list: true,
            },
          },
        },
      });

      if (!board) {
        throw new NotFoundException('Board not found');
      }

      return {
        ...board,
        counts: board._count,
        lists: board.list.map((list) => ({
          ...list,
          tasks: list.tasks.map((task) => ({
            ...task,
            completedSubTasks: task.subTask.filter(
              (subTask) => subTask.isCompleted,
            ).length,
            totalSubTasks: task.subTask.length,
            counts: task._count,
          })),
        })),
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      this.logger.error(`Failed to get board details: ${errorMessage}`);
      throw error;
    }
  }

  async updateBoard(
    boardId: string,
    userId: string,
    updateBoardDto: UpdateBoardDto,
  ) {
    try {
      const checkBoardOwner = await this.prisma.boardMember.findUnique({
        where: {
          userId_boardId: { userId: userId, boardId },
        },
      });

      if (!checkBoardOwner || checkBoardOwner.role !== 'OWNER') {
        throw new BadRequestException(
          'You do not have sufficient authority to do this',
        );
      }

      const board = await this.prisma.board.update({
        where: { id: boardId },
        data: {
          title: updateBoardDto.title,
          description: updateBoardDto.description,
        },
      });

      this.logger.log(`Board updated: ${board.id}`);
      return board;
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'BoardService.updateBoard');
    }
  }

  async addMemberToBoard(addMemberDto: AddMemberDto, userId: string) {
    try {
      const { boardId, role, userId: memberId } = addMemberDto;

      const checkBoardOwner = await this.prisma.boardMember.findUnique({
        where: {
          userId_boardId: { userId: userId, boardId },
        },
      });

      if (!checkBoardOwner || checkBoardOwner.role !== 'OWNER') {
        throw new BadRequestException(
          'You do not have sufficient authority to do this',
        );
      }

      const board = await this.prisma.board.findUnique({
        where: { id: addMemberDto.boardId },
        include: { member: true },
      });

      if (!board) {
        throw new NotFoundException('Board not found');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: memberId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const existingMember = board.member.find((m) => m.userId === memberId);

      if (existingMember) {
        throw new BadRequestException('User is already a member of this board');
      }

      const member = await this.prisma.boardMember.create({
        data: {
          boardId,
          userId: memberId,
          role: role as $Enums.Member,
        },
        include: {
          board: true,
        },
      });
      this.logger.log(
        `Added member ${member?.userId} to board ${member?.boardId}`,
      );

      await this.emailService.sendEmail({
        subject: 'You have been added to a board',
        to: user.email,
        template: 'board-access-email.ejs',
        variables: {
          role: member.role,
          name: user.name,
          boardName: board.title,
        },
      });
      return member;
    } catch (error: any) {
      this.errorHandler.handleError(error as Error, 'BoardService.addMember');
    }
  }

  async deleteMember(boardId: string, memberId: string, userId: string) {
    try {
      const checkBoardOwner = await this.prisma.boardMember.findUnique({
        where: { userId_boardId: { userId, boardId } },
      });

      if (!checkBoardOwner || checkBoardOwner.role !== 'OWNER') {
        throw new BadRequestException(
          'You do not have sufficient authority to do this',
        );
      }

      await this.prisma.boardMember.delete({
        where: { userId_boardId: { userId: memberId, boardId } },
      });

      this.logger.log(`Member ${memberId} removed from board ${boardId}`);

      return `Member ${memberId} removed from board ${boardId}`;
    } catch (error: any) {
      this.errorHandler.handleError(
        error as Error,
        'BoardService.deleteMember',
      );
    }
  }

  async deleteBoard(boardId: string, userId: string) {
    try {
      const checkBoardOwner = await this.prisma.boardMember.findUnique({
        where: { userId_boardId: { userId, boardId } },
      });

      if (!checkBoardOwner || checkBoardOwner.role !== 'OWNER') {
        throw new BadRequestException(
          'You do not have sufficient authority to do this',
        );
      }

      await this.prisma.board.delete({
        where: { id: boardId },
      });

      this.logger.log(`Board ${boardId} deleted`);

      return `Board ${boardId} deleted`;
    } catch (error: any) {
      this.errorHandler.handleError(error as Error, 'BoardService.deleteBoard');
    }
  }
}
