import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { LabelService } from './label.service';
import { Label } from 'y/common/entities/label.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'y/common/guards/auth.guard';
import { Request } from 'express';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';

@Resolver('Label')
export class LabelResolver {
  constructor(private readonly labelService: LabelService) {}

  @Mutation(() => Label)
  @UseGuards(AuthGuard)
  async createLabel(
    @Context() ctx: { req: Request },
    @Args('createLabelDto') createLabelDto: CreateLabelDto,
  ) {
    const { id: userId } = ctx.req.me as { id: string; email: string };

    const response = await this.labelService.createLabel(
      createLabelDto,
      userId,
    );
    return response;
  }

  @Mutation(() => Label)
  @UseGuards(AuthGuard)
  async updateLabel(
    @Context() ctx: { req: Request },
    @Args('updateLabelDto') updateLabelDto: UpdateLabelDto,
    @Args('id') labelId: string,
  ) {
    const { id: userId } = ctx.req.me as { id: string; email: string };
    const response = await this.labelService.updateLabel(
      labelId,
      updateLabelDto,
      userId,
    );
    return response;
  }

  @Mutation(() => Label)
  @UseGuards(AuthGuard)
  async deleteLabel(
    @Context() ctx: { req: Request },
    @Args('id') labelId: string,
  ) {
    const { id: userId } = ctx.req.me as { id: string; email: string };

    const response = await this.labelService.deleteLabel(labelId, userId);
    return response;
  }
}
