// task.entity.ts
import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { List } from './list.entity';
import { User } from './user.entity';
import { UserTask } from './userTask.entity';
import { FileAttachment } from './file-attachment.entity';
import { Discussion } from './discussion.entity';
import { Subtask } from './subtask.entity';
import { Label } from './label.entity';
import { TaskStatus } from './task-status.entity';
import { TaskLike } from './task-like.entity';

@ObjectType()
@Entity()
@Index(['listId'])
@Index(['assignerId'])
export class Task {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  taskId: string;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => Int)
  @Column({ type: 'int' })
  orderId: number;

  @Field(() => String)
  @Index() // Đánh index cho listId
  @Column()
  listId: string;

  @ManyToOne(() => List, (list) => list.task)
  list: List;

  @Field(() => String, { nullable: true })
  @Index()
  @Column({ nullable: true })
  assignerId?: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.assignerTasks)
  assigner?: User;

  @Field(() => [UserTask])
  @OneToMany(() => UserTask, (userTask) => userTask.task)
  assignedTo: UserTask[];

  @Field(() => [FileAttachment])
  @OneToMany(() => FileAttachment, (attachment) => attachment.task)
  attachments: FileAttachment[];

  @Field(() => [Subtask])
  @OneToMany(() => Subtask, (subtask) => subtask.task)
  subTasks: Subtask[];

  @Field(() => [Discussion])
  @OneToMany(() => Discussion, (discussion) => discussion.task)
  discussion: Discussion[];

  @Field(() => [Label])
  @OneToMany(() => Label, (label) => label.tasks)
  labels: Label[];

  @Field()
  @Column()
  statusId: string;

  @ManyToOne(() => TaskStatus, (status) => status.tasks)
  status: TaskStatus;

  @Field(() => [TaskLike])
  @OneToMany(() => TaskLike, (like) => like.task)
  likes: TaskLike[];
}
