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

import { TaskLike } from './task-like.entity';
import { Priority } from '../enum/priority.enum';
import { Board } from './board.entity';

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

  @Field(() => Number)
  @Directive('@shareable')
  @Column()
  taskNumber: number;

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
  @Column({ type: 'int', default: 0 })
  orderId: number;

  @Field(() => String)
  @Directive('@shareable')
  @Index() // Đánh index cho listId
  @Column()
  listId: string;

  @ManyToOne(() => List, (list) => list.tasks)
  list: List;

  @Field(() => String)
  @Directive('@shareable')
  @Column()
  boardId: string;

  @ManyToOne(() => Board, (board) => board.tasks)
  board: Task[];

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

  @Field(() => Priority)
  @Directive('@shareable')
  priority: Priority;

  @Field(() => [TaskLike])
  @Directive('@shareable')
  @OneToMany(() => TaskLike, (like) => like.task)
  likes: TaskLike[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
