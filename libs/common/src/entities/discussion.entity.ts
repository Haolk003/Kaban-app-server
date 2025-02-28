import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Task } from './task.entity';
import { FileAttachment } from './file-attachment.entity';

@ObjectType()
@Entity()
export class Discussion {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  content: string;

  @Field()
  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.taskDiscussions, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Field()
  @Column()
  taskId: string;

  @ManyToOne(() => Task, (task) => task.discussion, { onDelete: 'CASCADE' })
  task: Task;

  @Field(() => [FileAttachment], { nullable: true })
  @OneToMany(() => FileAttachment, (attachment) => attachment.discussion, {
    cascade: true,
  })
  attachments?: FileAttachment[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
