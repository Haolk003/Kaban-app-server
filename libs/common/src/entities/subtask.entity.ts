import { ObjectType, Field, ID, Directive } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from './task.entity';

@ObjectType()
@Directive('@key(fields: "id")')
@Entity()
export class Subtask {
  @Field(() => ID)
  @Directive('@shareable')
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Directive('@shareable')
  @Column()
  title: string;

  @Field({ nullable: true })
  @Directive('@shareable')
  @Column({ nullable: true })
  description?: string;

  @Field()
  @Directive('@shareable')
  @Column({ default: false })
  isCompleted: boolean;

  @Field()
  @Directive('@shareable')
  @Column()
  taskId: string;

  @ManyToOne(() => Task, (task) => task.subTasks, { onDelete: 'CASCADE' })
  task: Task;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
