// task.entity.ts
import { ObjectType, Field, Int, Directive, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
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
@Directive('@key(fields: "id")')
@Entity()
@Index(['listId'])
@Index(['assignerId'])
export class Task {
  @Field(() => ID)
  @Directive('@shareable')
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Directive('@shareable')
  @Column()
  taskId: string;

  @Field()
  @Directive('@shareable')
  @Column()
  title: string;

  @Field({ nullable: true })
  @Directive('@shareable')
  @Column({ nullable: true })
  description?: string;

  @Field(() => Int)
  @Directive('@shareable')
  @Column({ type: 'int' })
  orderId: number;

  @Field(() => String)
  @Directive('@shareable')
  @Index() // Đánh index cho listId
  @Column()
  listId: string;

  @ManyToOne(() => List, (list) => list.task)
  list: List;

  @Field(() => String, { nullable: true })
  @Directive('@shareable')
  @Index()
  @Column({ nullable: true })
  assignerId?: string;

  @Field(() => User, { nullable: true })
  @Directive('@shareable')
  @ManyToOne(() => User, (user) => user.assignerTasks)
  assigner?: User;

  @Field(() => [UserTask])
  @Directive('@shareable')
  @OneToMany(() => UserTask, (userTask) => userTask.task)
  assignedTo: UserTask[];

  @Field(() => [FileAttachment])
  @Directive('@shareable')
  @OneToMany(() => FileAttachment, (attachment) => attachment.task)
  attachments: FileAttachment[];

  @Field(() => [Subtask])
  @Directive('@shareable')
  @OneToMany(() => Subtask, (subtask) => subtask.task)
  subTasks: Subtask[];

  @Field(() => [Discussion])
  @Directive('@shareable')
  @OneToMany(() => Discussion, (discussion) => discussion.task)
  discussion: Discussion[];

  @Field(() => [Label])
  @Directive('@shareable')
  @OneToMany(() => Label, (label) => label.tasks)
  labels: Label[];

  @Field()
  @Directive('@shareable')
  @Column()
  statusId: string;

  @ManyToOne(() => TaskStatus, (status) => status.tasks)
  status: TaskStatus;

  @Field(() => [TaskLike])
  @Directive('@shareable')
  @OneToMany(() => TaskLike, (like) => like.task)
  likes: TaskLike[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
