import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ID, registerEnumType } from '@nestjs/graphql';
import { Member, BoardStatus } from '@prisma/client';
@ObjectType()
export class TasksCount {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  completed: number;
}

@ObjectType()
export class BoardResponse {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  projectKey: string;

  @Field()
  color: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => TasksCount)
  tasksCount: TasksCount;

  @Field(() => Int)
  membersCount: number;

  @Field(() => String)
  role: string;

  @Field(() => String)
  status: string;

  @Field(() => Boolean)
  isOwner: boolean;
}

// Đăng ký các enum
registerEnumType(Member, { name: 'Member' });

registerEnumType(BoardStatus, { name: 'BoardStatus' });

@ObjectType()
export class AvatarResponse {
  @Field(() => String, { nullable: true })
  url?: string;

  @Field(() => String, { nullable: true })
  publicId?: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  avatar?: AvatarResponse;
}

@ObjectType()
export class SubtaskResponse {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  isCompleted: boolean;
}

@ObjectType()
export class LabelResponse {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;
}

@ObjectType()
export class TaskCounts {
  @Field(() => Int)
  subTask: number;

  @Field(() => Int)
  likes: number;

  @Field(() => Int)
  discussion: number;
}

@ObjectType()
export class UserTaskResponse {
  @Field(() => UserResponse)
  user: UserResponse;
}

@ObjectType()
export class TaskResponse {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  taskId:string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [SubtaskResponse])
  subTask: SubtaskResponse[];

  @Field(() => UserResponse, { nullable: true })
  assigner?: UserResponse;

  @Field(() => [LabelResponse])
  labels: LabelResponse[];

  @Field(() => [UserTaskResponse])
  assignedTo: UserTaskResponse[];

  @Field(() => TaskCounts)
  counts: TaskCounts;

  @Field(() => Int)
  completedSubtasks: number;

  @Field(() => Int)
  totalSubtasks: number;

  @Field(() => String)
  priority: string;

  @Field(() => Date, { nullable: true })
  dueDate?: Date;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class ListResponse {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Int)
  order: number;

  @Field()
  status: string;

  @Field(() => [TaskResponse])
  tasks: TaskResponse[];
}

@ObjectType()
export class BoardMemberResponse {
  @Field(() => UserResponse)
  user: UserResponse;

  @Field(() => Member)
  role: Member;
}

@ObjectType()
export class BoardCounts {
  @Field(() => Int)
  tasks: number;

  @Field(() => Int)
  member: number;

  @Field(() => Int)
  lists: number;
}

@ObjectType()
export class BoardDetailResponse {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  projectKey: string;

  @Field()
  color: string;

  @Field(() => BoardStatus)
  status: BoardStatus;

  @Field(() => UserResponse)
  owner: UserResponse;

  @Field(() => [ListResponse])
  lists: ListResponse[];

  @Field(() => [BoardMemberResponse])
  member: BoardMemberResponse[];

  @Field(() => [LabelResponse])
  labels: LabelResponse[];

  @Field(() => BoardCounts)
  counts: BoardCounts;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
