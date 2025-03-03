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
@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async createBoard(createBoardDto: CreateBoardDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const owner = await tx.user.findUnique({
          where: { id: createBoardDto.ownerId },
        });

        if (!owner) {
          throw new NotFoundException('User not found');
        }

        const board = await tx.board.create({
          data: {
            title: createBoardDto.title,
            description: createBoardDto.description || '',
            ownerId: createBoardDto.ownerId,
            member: {
              create: {
                userId: createBoardDto.ownerId,
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
          })),
        });

        this.logger.log(`Board created: ${board.id}`);
        return board;
      });
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Failed to create board: ${error.message}`);
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
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Failed to update board: ${error.message}`);
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
          role,
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Failed to add member: ${error.message}`);
      throw error;
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Failed to remove member: ${error.message}`);
      throw error;
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Failed to delete board: ${error.message}`);
      throw error;
    }
  }
}
