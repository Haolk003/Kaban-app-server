import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field(() => String, { nullable: true })
  avatar?: string | null;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  googleId?: string | null;

  @Field(() => String, { nullable: true })
  password_reset_token_hash?: string | null;

  @Field(() => String, { nullable: true })
  password_reset_expires_at?: Date | null;

  @Field(() => String, { nullable: true })
  password_reset_created_at?: Date | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
