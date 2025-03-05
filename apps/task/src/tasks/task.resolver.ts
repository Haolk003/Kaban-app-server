import { Args, Context, Mutation, Resolver, Query } from '@nestjs/graphql';
import { TaskService } from './task.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'y/common/guards/auth.guard';
import { Task } from 'y/common/entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { Request } from 'express';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterInput } from './dto/task-filter.dto';
import { PaginationInput } from './dto/pagination-filter.dto';

@Resolver()
export class TaskResolver {
  constructor(private readonly taskService: TaskService) {}

  @Mutation(() => Task)
  @UseGuards(AuthGuard)
  async createTask(
    @Args('input') input: CreateTaskDto,
    @Context() ctx: { req: Request },
  ) {
    const { id: userId } = ctx.req.me as { id: string; email: string };
    const response = await this.taskService.createTask(userId, input);
    return response;
  }

  @Mutation(() => Task)
  @UseGuards(AuthGuard)
  async updateTask(
    @Args('updateTaskDto') updateTaskDto: UpdateTaskDto,
    @Args('taskId') id: string,
    @Context() ctx: { req: Request },
  ) {
    const { id: userId } = ctx.req.me as { id: string; email: string };
    const response = await this.taskService.updateTask(
      userId,
      id,
      updateTaskDto,
    );
    return response;
  }

  @Mutation(() => String)
  @UseGuards(AuthGuard)
  async deleteTask(
    @Args('taskId') id: string,
    @Context() ctx: { req: Request },
  ) {
    const { id: userId } = ctx.req.me as { id: string; email: string };

    const response = await this.taskService.deleteTask(userId, id);
    return response;
  }

  @Query(() => [Task])
  @UseGuards(AuthGuard)
  async getTasks(
    @Args('taskFilterDto') taskFilterInput: TaskFilterInput,
    @Args('taskPaginationDto') taskPaginationInput: PaginationInput,
  ) {
    const response = await this.taskService.getTasks(
      taskFilterInput,
      taskPaginationInput,
    );

    return response;
  }
}
