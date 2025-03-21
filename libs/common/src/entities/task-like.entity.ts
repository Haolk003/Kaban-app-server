import { ObjectType, Field, ID, Directive } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique,
  Index,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Task } from './task.entity';

@ObjectType()
@Directive('@key(fields: "id")')
@Entity()
@Unique(['userId', 'taskId']) // Đảm bảo mỗi người chỉ like một task một lần
export class TaskLike {
  @Field(() => ID)
  @Directive('@shareable')
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Directive('@shareable')
  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => User, (user) => user.taskLikes, { onDelete: 'CASCADE' })
  user: User;

  @Field()
  @Directive('@shareable')
  @Column()
  @Index()
  taskId: string;

  @ManyToOne(() => Task, (task) => task.likes, { onDelete: 'CASCADE' })
  task: Task;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
