import { ObjectType, Field, ID, Directive } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Task } from './task.entity';
import { Board } from './board.entity';

@ObjectType()
@Directive('@key(fields: "id")')
@Entity()
@Unique(['name', 'boardId'])
export class Label {
  @Field(() => String)
  @Directive('@shareable')
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Directive('@shareable')
  @Column()
  name: string;

  @Field(() => [Task], { nullable: true })
  @Directive('@shareable')
  @ManyToMany(() => Task, (task) => task.labels)
  @JoinTable()
  tasks?: Task[];

  @Field(() => ID)
  @Directive('@shareable')
  @Column()
  boardId: string;

  @ManyToOne(() => Board, (board) => board.labels)
  @JoinColumn({ name: 'boardId' })
  board: Board;
}
