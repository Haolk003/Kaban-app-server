import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Board } from './board.entity';
import { Task } from './task.entity';

@ObjectType()
@Entity()
export class List {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  boardId: string;

  @Field()
  @Index()
  @ManyToOne(() => Board, (board) => board.lists)
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Field(() => [Task])
  @OneToMany(() => Task, (task) => task.list)
  task: Task[];

  @Field()
  @Column()
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
