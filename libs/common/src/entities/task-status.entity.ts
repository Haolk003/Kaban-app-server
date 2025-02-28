import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from './task.entity';

@ObjectType()
@Entity()
export class TaskStatus {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  name: string;

  @Field(() => [Task], { nullable: true })
  @OneToMany(() => Task, (task) => task.status)
  tasks?: Task[];
}
