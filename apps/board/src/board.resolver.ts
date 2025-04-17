import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BoardService } from './board.service';
import { Board } from 'y/common/entities/board.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'y/common/guards/auth.guard';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

import { Request } from 'express';

import { BoardMember } from 'y/common/entities/board-member.entity';
import { AddMemberDto } from './dto/add-member-board.dto';
import { DeleteMemberBoardDto } from './dto/delete-member-board.dto';
import { DeleteBoardDto } from './dto/delete-board.dto';

@Resolver('Board')
export class BoardResolver {
  constructor(private readonly boardService: BoardService) {}

  @Mutation(() => Board)
  @UseGuards(AuthGuard)
  async newBoard(
    @Context() ctx: { req: Request },
    @Args('createBoardInput') createdBoardDto: CreateBoardDto,
  ) {
    const { id: userId } = ctx.req.me as { id: string; email: string };
    const response = await this.boardService.createBoard(
      createdBoardDto,
      userId,
    );
    return response;
  }

  @Query(() => [Board])
  @UseGuards(AuthGuard)
  async getBoardsByUserId(@Context() ctx: { req: Request }) {
    const { id: userId } = ctx.req.me as { id: string; email: string };

    const response = await this.boardService.getBoardsByUserId(userId);
    return response;
  }

  @Query(() => Board)
  @UseGuards(AuthGuard)
  async getBoardById(@Context() ctx: { req: Request }, @Args('id') id: string) {
    const { id: userId } = ctx.req.me as { id: string; email: string };

    const response = await this.boardService.getBoardById(id, userId);
    return response;
  }

  @Mutation(() => Board)
  @UseGuards(AuthGuard)
  async updateBoard(
    @Context() ctx: { req: Request },
    @Args('id') id: string,
    @Args('updateBoardDto') updateBoardDto: UpdateBoardDto,
  ) {
    const { id: userId } = ctx.req.me as { id: string; email: string };

    return this.boardService.updateBoard(id, userId, updateBoardDto);
  }

  @Mutation(() => BoardMember)
  @UseGuards(AuthGuard)
  async addMemberToBoard(
    @Context() ctx: { req: Request },
    @Args('addMemberBoardDto') addMemberBoardDto: AddMemberDto,
  ) {
    const { id: userId } = ctx.req.me as { id: string; email: string };

    const response = await this.boardService.addMemberToBoard(
      addMemberBoardDto,
      userId,
    );
    return response;
  }

  @Mutation(() => String)
  @UseGuards(AuthGuard)
  async deleteMemberToBoard(
    @Context() ctx: { req: Request },
    @Args('deleteMemberBoardDto') deleteMemberBoardDto: DeleteMemberBoardDto,
  ) {
    const { id: userId } = ctx.req.me as { id: string; email: string };
    const { boardId, memberId } = deleteMemberBoardDto;

    const response = await this.boardService.deleteMember(
      boardId,
      memberId,
      userId,
    );
    return response;
  }

  @Mutation(() => String)
  @UseGuards(AuthGuard)
  async deleteBoardByOwner(
    @Context() ctx: { req: Request },
    @Args('deleteBoardDto') deleteBoardDto: DeleteBoardDto,
  ) {
    const { id: userId } = ctx.req.me as { id: string; email: string };

    const response = await this.boardService.deleteBoard(
      deleteBoardDto.boardId,
      userId,
    );
    return response;
  }
}
