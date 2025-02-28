import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Task } from './task.entity';
import { Discussion } from './discussion.entity';
import { User } from './user.entity';

@ObjectType()
@Entity()
export class FileAttachment {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  fileName: string;

  @Field()
  @Column()
  filePath: string;

  @Field()
  @Column()
  fileType: string;

  @Field(() => Int)
  @Column()
  fileSize: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  @Index()
  taskId?: string;

  @ManyToOne(() => Task, (task) => task.attachments, { nullable: true })
  task?: Task;

  @Field({ nullable: true })
  @Column({ nullable: true })
  @Index()
  discussionId?: string;

  @ManyToOne(() => Discussion, (discussion) => discussion.attachments, {
    nullable: true,
  })
  discussion?: Discussion;

  @Field()
  @Column()
  uploadedById: string;

  @ManyToOne(() => User, (user) => user.attachments)
  uploadedBy: User;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
