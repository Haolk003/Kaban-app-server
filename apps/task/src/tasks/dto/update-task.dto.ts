import { Field, InputType } from '@nestjs/graphql';
import { Priority } from '@prisma/client';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class UpdateTaskDto {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  lsitId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  priority?: Priority;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  assignedTo?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  labels?: string[];
}

export class AssignTaskDto {
  @IsString()
  taskId: string;

  @IsString()
  userId: string;
}
