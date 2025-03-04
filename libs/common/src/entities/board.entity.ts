// board.entity.ts
import { ObjectType, Field, ID, Directive } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { User } from './user.entity';

import { List } from './list.entity';
import { BoardMember } from './board-member.entity';
import { Label } from './label.entity';

@ObjectType()
@Directive('@key(fields: "id")')
@Entity()
export class Board {
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

  @Field(() => String)
  @Directive('@shareable')
  @Column()
  ownerId: string;

  @Field(() => User)
  @Directive('@shareable')
  @Directive('@shareable')
  @OneToOne(() => User, (user) => user.boards)
  owner?: User;

  @Directive('@shareable')
  @Field(() => [BoardMember])
  @OneToMany(() => BoardMember, (boardMember) => boardMember.board)
  member: BoardMember[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Directive('@shareable')
  @Field(() => [List])
  @OneToMany(() => List, (list) => list.board)
  list: List[];

  @Directive('@shareable')
  @Field(() => [List])
  @OneToMany(() => Label, (label) => label.board)
  labels: Label[];
}
