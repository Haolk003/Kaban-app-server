import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Task } from './task.entity';

@ObjectType()
@Entity()
@Unique(['userId', 'taskId']) // Đảm bảo mỗi người chỉ like một task một lần
export class TaskLike {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => User, (user) => user.taskLikes, { onDelete: 'CASCADE' })
  user: User;

  @Field()
  @Column()
  @Index()
  taskId: string;

  @ManyToOne(() => Task, (task) => task.likes, { onDelete: 'CASCADE' })
  task: Task;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
