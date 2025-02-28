import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Task } from './task.entity';

@ObjectType()
@Entity()
@Unique(['userId', 'taskId']) // Đảm bảo mỗi user chỉ có một task duy nhất
export class UserTask {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.userTasks)
  user: User;

  @Field()
  @Column()
  taskId: string;

  @ManyToOne(() => Task, (task) => task.assignedTo)
  task: Task;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
