import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  avatar?: string | null;

  @Field()
  isVerified: boolean;

  @Field(() => String, { nullable: true })
  verification_token?: string | null;

  @Field(() => Date, { nullable: true })
  verification_token_expires_at?: Date | null;

  @Field(() => String, { nullable: true })
  activation_code?: string | null;

  @Field(() => String, { nullable: true })
  password_reset_token_hash?: string | null;

  @Field(() => Date, { nullable: true })
  password_reset_expires_at?: Date | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [Account], { nullable: true })
  accounts?: Account[]; // Thêm trường accounts để liên kết với bảng Account
}
