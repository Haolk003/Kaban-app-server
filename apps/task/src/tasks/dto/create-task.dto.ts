import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

import { Priority } from 'y/common/enum/priority.enum';

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

  @Field(() => String)
  @IsOptional()
  priority?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  dueDate?: string;

  @Field(() => [AttachmentInput], { nullable: true })
  @IsOptional()
  attachmentsInput?: AttachmentInput[];
}
@InputType()
export class AttachmentInput {
  @Field(() => String)
  fileName: string;

  @Field(() => String)
  filePath: string;

  @Field(() => Number)
  fileSize: number;

  @Field(() => String)
  fileType: string;

  @Field(() => String)
  file_public_id: string;
}

export class AssignTaskDto {
  @IsString()
  taskId: string;

  @IsString()
  userId: string;
}
