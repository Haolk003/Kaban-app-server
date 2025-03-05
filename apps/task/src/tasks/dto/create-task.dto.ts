import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateTaskDto {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  @IsOptional()
  description?: string;

  @Field()
  @IsString()
  listId: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  assignedTo?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  labelIds?: string[];
}

export class AssignTaskDto {
  @IsString()
  taskId: string;

  @IsString()
  userId: string;
}
