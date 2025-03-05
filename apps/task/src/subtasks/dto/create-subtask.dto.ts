import { Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateSubTaskDto {
  @Field()
  @IsString()
  title: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => ID)
  taskId: string;
}
