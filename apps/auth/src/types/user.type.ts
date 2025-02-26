import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class ErrorType {
  @Field()
  message: string;

  @Field({ nullable: true })
  code?: string;
}

@ObjectType()
export class LoginResponse {
  @Field()
  access_token: string;

  @Field()
  refresh_token: string;

  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}

@ObjectType()
export class RegisterResponse {
  @Field()
  token: string;

  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}
