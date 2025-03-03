import { ObjectType, Field, ID, Directive } from '@nestjs/graphql';
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
@Directive('@key(fields: "id")')
@Entity()
export class Discussion {
  @Field(() => ID)
  @Directive('@shareable')
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Directive('@shareable')
  @Column()
  content: string;

  @Field()
  @Directive('@shareable')
  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.taskDiscussions, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Field()
  @Directive('@shareable')
  @Column()
  taskId: string;

  @ManyToOne(() => Task, (task) => task.discussion, { onDelete: 'CASCADE' })
  task: Task;

  @Field(() => [FileAttachment], { nullable: true })
  @Directive('@shareable')
  @OneToMany(() => FileAttachment, (attachment) => attachment.discussion, {
    cascade: true,
  })
  attachments?: FileAttachment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
