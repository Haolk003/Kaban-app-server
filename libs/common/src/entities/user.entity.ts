// user.entity.ts
import { ObjectType, Field, Directive, ID, HideField } from '@nestjs/graphql';
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
import { BoardMember } from './board-member.entity';

@ObjectType()
export class Avatar {
  @Field(() => String, { nullable: true })
  @Directive('@shareable')
  url?: string;

  @Field(() => String, { nullable: true })
  @Directive('@shareable')
  public_id?: string;
}

@Directive('@key(fields: "id")')
@ObjectType()
@Entity()
export class User {
  @Directive('@shareable')
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Directive('@shareable')
  @Column({ unique: true })
  email: string;

  @Field()
  @Directive('@shareable')
  @Column()
  name: string;

  @Field(() => Avatar, { nullable: true })
  @Directive('@shareable')
  @Column('json', { nullable: true })
  avatar?: Avatar;

  @Field({ defaultValue: false })
  @Directive('@shareable')
  @Column({ default: false })
  isVerified: boolean;

  @Field(() => String, { nullable: true })
  @Directive('@shareable')
  @Column({ nullable: true })
  bio?: string;

  @Field(() => String, { nullable: true })
  @Directive('@shareable')
  @Column({ nullable: true })
  location?: string;

  @Field(() => String, { nullable: true })
  @Directive('@shareable')
  @Column({ nullable: true })
  jobName?: string;

  @HideField()
  @Column({ nullable: true })
  verification_token?: string;

  @HideField()
  @Column({ nullable: true })
  activation_code?: string;

  @HideField()
  @Column({ nullable: true })
  verification_token_expires_at?: Date;

  @HideField()
  @Column({ nullable: true })
  password_reset_token_hash?: string;

  @Column({ nullable: true })
  password_reset_expires_at?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Directive('@shareable')
  @Field(() => [Board])
  @OneToMany(() => Board, (board) => board.owner, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  boards: Board[];

  @Field(() => [Account])
  @Directive('@shareable')
  @OneToMany(() => Account, (account) => account.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  accounts: Account[];

  @Field(() => [UserTask])
  @Directive('@shareable')
  @OneToMany(() => UserTask, (userTask) => userTask.user)
  userTasks: UserTask[];

  @OneToMany(() => Task, (task) => task.assigner)
  assignerTasks: Task[];

  @OneToMany(() => FileAttachment, (file) => file.uploadedBy)
  attachments: FileAttachment[];

  @OneToMany(() => Discussion, (discussion) => discussion.user)
  taskDiscussions: Discussion[];

  @OneToMany(() => TaskLike, (taskLike) => taskLike.user)
  taskLikes: TaskLike[];

  @Field(() => [BoardMember])
  @Directive('@shareable')
  @OneToMany(() => BoardMember, (boardMember) => boardMember.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  boardMembers: BoardMember[];
}
