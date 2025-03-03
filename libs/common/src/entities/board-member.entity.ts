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
import { Board } from './board.entity';

@ObjectType()
@Directive('@key(fields: "id")')
@Entity()
@Unique(['userId', 'boardId']) // Đảm bảo mỗi người dùng chỉ có một vai trò trong một bảng
export class BoardMember {
  @Field(() => ID)
  @Directive('@shareable')
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Directive('@shareable')
  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.boardMembers, { onDelete: 'CASCADE' })
  user: User;

  @Field(() => String)
  @Directive('@shareable')
  @Column()
  boardId: string;

  @ManyToOne(() => Board, (board) => board.member, { onDelete: 'CASCADE' })
  board: Board;

  @Directive('@shareable')
  @Field()
  @Column()
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
