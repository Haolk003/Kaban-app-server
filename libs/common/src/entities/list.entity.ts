import { Directive, Field, ObjectType } from '@nestjs/graphql';
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
@Directive('@key(fields: "id")')
@Entity()
export class List {
  @Field()
  @Directive('@shareable')
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Directive('@shareable')
  @Column()
  name: string;

  @Field()
  @Directive('@shareable')
  @Column()
  boardId: string;

  @Index()
  @ManyToOne(() => Board, (board) => board.list)
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Field(() => [Task])
  @Directive('@shareable')
  @OneToMany(() => Task, (task) => task.list)
  task: Task[];

  @Field()
  @Directive('@shareable')
  @Column()
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
