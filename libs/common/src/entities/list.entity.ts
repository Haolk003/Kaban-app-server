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

  @Field(() => String, { nullable: true })
  @Directive('@shareable')
  @Column()
  color?: string;

  @Field(() => String, { nullable: true })
  @Directive('@shareable')
  @Column()
  icon?: string;

  @Field(() => String, { nullable: true })
  @Directive('@shareable')
  @Column()
  description?: string;

  @Index()
  @ManyToOne(() => Board, (board) => board.list)
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Field(() => [Task])
  @Directive('@shareable')
  @OneToMany(() => Task, (task) => task.list)
  tasks: Task[];

  @Field()
  @Directive('@shareable')
  @Column()
  order: number;

  @Field()
  @Directive('@shareable')
  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
