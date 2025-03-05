import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { SubTaskService } from './subTask.service';
import { Subtask } from 'y/common/entities/subtask.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'y/common/guards/auth.guard';
import { CreateSubTaskDto } from './dto/create-subtask.dto';
import { Request } from 'express';
import { UpdateSubTaskDto } from './dto/update-subtask.dto';

@Resolver()
export class SubTaskResolver {
  constructor(private readonly subTaskService: SubTaskService) {}

  @Mutation(() => Subtask)
  @UseGuards(AuthGuard)
  async createSubTask(
    @Args('createSubTaskDto') createSubTaskDto: CreateSubTaskDto,
    @Context() ctx: { req: Request },
  ) {
    const { id: userId } = ctx.req.me as { id: string; email: string };

    const response = await this.subTaskService.createSubTask(
      createSubTaskDto,
      userId,
    );
    return response;
  }

  @Mutation(() => Subtask)
  @UseGuards(AuthGuard)
  async updateSubTask(
    @Args('updateSubTaskDto') updateSubTaskDto: UpdateSubTaskDto,
    @Args('subTaskId') subTaskId: string,
    @Context() ctx: { req: Request },
  ) {
    const { id: userId } = ctx.req.me as { id: string; email: string };

    const response = await this.subTaskService.updateSubTask(
      subTaskId,
      updateSubTaskDto,
      userId,
    );
    return response;
  }

  @Mutation(() => String)
  @UseGuards(AuthGuard)
  async deleteSubtask(
    @Args('subtaskId') subTaskId: string,
    @Context() ctx: { req: Request },
  ) {
    const { id: userId } = ctx.req.me as { id: string; email: string };
    const response = await this.subTaskService.deleteSubTask(subTaskId, userId);
    return response;
  }
}
