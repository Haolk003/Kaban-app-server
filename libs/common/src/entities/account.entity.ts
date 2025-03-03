// account.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Directive('@key(fields: "id")')
@Entity()
@Unique(['provider', 'userId'])
export class Account {
  @Field(() => ID)
  @Directive('@shareable')
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Directive('@shareable')
  @Column()
  userId: string;

  @Field(() => User)
  @Directive('@shareable')
  @ManyToOne(() => User, (user) => user.accounts)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field()
  @Directive('@shareable')
  @Column()
  provider: string;

  @Field(() => String, { nullable: true })
  @Directive('@shareable')
  @Column({ nullable: true })
  providerId?: string | null;

  @Field(() => String, { nullable: true })
  @Directive('@shareable')
  @Column({ nullable: true })
  passwordHash?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
