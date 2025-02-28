// user.entity.ts
import { Field, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
// import { Board, Account, BoardMember, Task, Discussion, UserTask, FileAttachment, TaskLike } from './';

@ObjectType()
@Entity()
export class User {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verification_token: string;

  @Column({ nullable: true })
  activation_code: string;

  @Column({ nullable: true })
  verification_token_expires_at: Date;

  @Column({ nullable: true })
  password_reset_token_hash: string;

  @Column({ nullable: true })
  password_reset_expires_at: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //   @OneToMany(() => Board, board => board.owner)
  //   boards: Board[];

  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];

  //   @OneToMany(() => BoardMember, boardMember => boardMember.user)
  //   boardMembers: BoardMember[];

  //   @OneToMany(() => Task, task => task.assigner)
  //   assignerTasks: Task[];

  //   @OneToMany(() => Discussion, discussion => discussion.user)
  //   taskDiscussions: Discussion[];

  //   @OneToMany(() => UserTask, userTask => userTask.user)
  //   userTasks: UserTask[];

  //   @OneToMany(() => FileAttachment, attachment => attachment.uploadedBy)
  //   attachments: FileAttachment[];

  //   @OneToMany(() => TaskLike, like => like.user)
  //   taskLikes: TaskLike[];
}

@Entity()
@Unique(['provider', 'userId'])
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.accounts)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  provider: string;

  @Column({ nullable: true })
  providerId: string;

  @Column({ nullable: true })
  passwordHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
