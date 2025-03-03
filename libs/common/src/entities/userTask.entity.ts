import { ObjectType, Field, ID, Directive } from '@nestjs/graphql';
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
@Directive('@key(fields: "id")')
@Entity()
@Unique(['userId', 'taskId']) // Đảm bảo mỗi user chỉ có một task duy nhất
export class UserTask {
  @Field(() => ID)
  @Directive('@shareable')
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Directive('@shareable')
  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.userTasks)
  user: User;

  @Field()
  @Directive('@shareable')
  @Column()
  taskId: string;

  @ManyToOne(() => Task, (task) => task.assignedTo)
  task: Task;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
