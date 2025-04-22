import { ObjectType, Field, Int } from '@nestjs/graphql';

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
