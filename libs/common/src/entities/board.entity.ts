// board.entity.ts
import { ObjectType, Field } from '@nestjs/graphql';
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

import { List } from './list.entity';

@ObjectType()
@Entity()
export class Board {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => String)
  @Column()
  ownerId: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.boards)
  owner: User;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => [List])
  @OneToMany(() => List, (list) => list.board)
  lists: List[];
}
