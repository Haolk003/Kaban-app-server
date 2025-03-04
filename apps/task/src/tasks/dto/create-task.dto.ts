import { IsAlpha, IsArray, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  listId: string;

  @IsString()
  @IsOptional()
  assignerId?: string;

  @IsArray()
  @IsOptional()
  labelIds?: string[];
}

export class AssignTaskDto {
  @IsString()
  taskId: string;

  @IsString()
  userId: string;
}
