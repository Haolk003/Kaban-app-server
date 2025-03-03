import { ObjectType, Field, ID, Int, Directive } from '@nestjs/graphql';
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
@Directive('@key(fields: "id")')
@Entity()
export class FileAttachment {
  @Field(() => ID)
  @Directive('@shareable')
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Directive('@shareable')
  @Column()
  fileName: string;

  @Field()
  @Directive('@shareable')
  @Column()
  filePath: string;

  @Field()
  @Directive('@shareable')
  @Column()
  fileType: string;

  @Field(() => Int)
  @Directive('@shareable')
  @Column()
  fileSize: number;

  @Field({ nullable: true })
  @Directive('@shareable')
  @Column({ nullable: true })
  @Index()
  taskId?: string;

  @ManyToOne(() => Task, (task) => task.attachments, { nullable: true })
  task?: Task;

  @Field(() => String, { nullable: true })
  @Directive('@shareable')
  @Column({ nullable: true })
  @Index()
  discussionId?: string;

  @ManyToOne(() => Discussion, (discussion) => discussion.attachments, {
    nullable: true,
  })
  discussion?: Discussion;

  @Field()
  @Directive('@shareable')
  @Column()
  uploadedById: string;

  @ManyToOne(() => User, (user) => user.attachments)
  uploadedBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
