import { ObjectType, Field, Directive } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  avatar: string;

  @Field()
  name: string;

  @Field()
  googleId: string;

  @Field()
  createdAt: Date;

  @Field()
  updateAt: Date;
}
