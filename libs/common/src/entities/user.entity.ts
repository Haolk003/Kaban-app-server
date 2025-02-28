// user.entity.ts
import { ObjectType, Field } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from './account.entity';
import { Board } from './board.entity';
import { UserTask } from './userTask.entity';
import { Task } from './task.entity';
import { FileAttachment } from './file-attachment.entity';
import { Discussion } from './discussion.entity';
import { TaskLike } from './task-like.entity';

@ObjectType()
@Entity()
export class User {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatar?: string;

  @Field({ defaultValue: false })
  @Column({ default: false })
  isVerified: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  verification_token?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  activation_code?: string;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  verification_token_expires_at?: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  password_reset_token_hash?: string;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  password_reset_expires_at?: Date;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => [Board])
  @OneToMany(() => Board, (board) => board.owner)
  boards: Board[];

  @Field(() => [Account])
  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];

  @Field(() => [UserTask])
  @OneToMany(() => UserTask, (userTask) => userTask.user)
  userTasks: UserTask[];

  @OneToMany(() => Task, (task) => task.assigner)
  assignerTasks: Task[];

  @Field()
  @OneToMany(() => FileAttachment, (file) => file.uploadedBy)
  attachments: FileAttachment[];

  @Field()
  @OneToMany(() => Discussion, (discussion) => discussion.user)
  taskDiscussions: Discussion[];

  @Field()
  @OneToMany(() => TaskLike, (taskLike) => taskLike.user)
  taskLikes: TaskLike[];
}
