import { ObjectType, Field, ID, Directive } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Task } from './task.entity';

@ObjectType()
@Directive('@key(fields: "id")')
@Entity()
export class Label {
  @Field(() => ID)
  @Directive('@shareable')
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Directive('@shareable')
  @Column({ unique: true })
  name: string;

  @Field(() => [Task], { nullable: true })
  @Directive('@shareable')
  @ManyToMany(() => Task, (task) => task.labels)
  @JoinTable()
  tasks?: Task[];
}
