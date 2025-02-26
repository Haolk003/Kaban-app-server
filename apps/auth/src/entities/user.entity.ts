import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field(() => String, { nullable: true })
  password?: string | null;

  @Field()
  loginType: string;

  @Field(() => String, { nullable: true })
  avatar?: string | null;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  googleId?: string | null;

  @Field(() => String, { nullable: true })
  githubId?: string | null;

  @Field(() => String, { nullable: true })
  password_reset_token_hash?: string | null;

  @Field(() => String, { nullable: true })
  password_reset_expires_at?: Date | null;

  @Field(() => String, { nullable: true })
  activation_code?: string | null;

  @Field()
  isVerified: boolean;

  @Field(() => String, { nullable: true })
  verification_token?: string | null;

  @Field(() => Date, { nullable: true })
  verification_token_expires_at?: Date | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
