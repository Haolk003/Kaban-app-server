import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Task } from './task.entity';

@ObjectType()
@Entity()
export class Label {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  name: string;

  @Field(() => [Task], { nullable: true })
  @ManyToMany(() => Task, (task) => task.labels)
  @JoinTable()
  tasks?: Task[];
}
