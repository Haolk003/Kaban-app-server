import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { ListService } from './list.service';
import { UseGuards } from '@nestjs/common';

import { CreateListDto } from './dto/create-list.dto';
import { Request } from 'express';
import { List } from 'y/common/entities/list.entity';
import { UpdateListDto } from './dto/update-list.dto';
import { AuthGuard } from 'y/common/guards/auth.guard';

@Resolver('List')
export class ListResolver {
  constructor(private readonly listService: ListService) {}

  @Mutation(() => List)
  @UseGuards(AuthGuard)
  async createList(
    @Args('createListDto') createListDto: CreateListDto,
    @Context() ctx: { req: Request },
  ) {
    const { id: userId } = ctx.req.me as { id: string; email: string };

    const response = await this.listService.createList(userId, createListDto);
    return response;
  }

  @Mutation(() => List)
  @UseGuards(AuthGuard)
  async updateList(
    @Args('listId') listId: string,
    @Args('updatedListDto') updateListDto: UpdateListDto,
    @Context() ctx: { req: Request },
  ) {
    const { id: userId } = ctx.req.me as { id: string; email: string };

    const response = await this.listService.updateList(
      listId,
      updateListDto,
      userId,
    );
    return response;
  }

  @Mutation(() => String)
  @UseGuards(AuthGuard)
  async deleteList(
    @Args('listId') listId: string,
    @Context() ctx: { req: Request },
  ) {
    const { id: userId } = ctx.req.me as { id: string; email: string };

    const response = await this.listService.deleteList(listId, userId);
    return response;
  }
}
