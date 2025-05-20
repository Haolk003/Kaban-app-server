import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class LoginDto {
  @Field()
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password: string;
}

@InputType()
export class RegisterDto {
  @Field()
  @IsNotEmpty({ message: 'First Name is required' })
  @MinLength(3, { message: 'First Name must be at least 3 characters' })
  @IsString({ message: 'First Name must need to be one string' })
  firstName: string;

  @Field()
  @IsNotEmpty({ message: 'Last Name is required' })
  @MinLength(3, { message: 'Last Name must be at least 3 characters' })
  @IsString({ message: 'Last Name must need to be one string' })
  lastName: string;

  @Field()
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @IsString()
  password: string;
}

@InputType()
export class ActivateUserDto {
  @Field()
  @IsNotEmpty({ message: 'Activation Code is required' })
  @IsString()
  activationCode: string;

  @Field()
  @IsNotEmpty({ message: 'Token is required' })
  @IsString()
  token: string;
}

@InputType()
export class forgotPasswordDto {
  @Field()
  @IsNotEmpty({ message: 'email is required' })
  email: string;
}

@InputType()
export class resetPasswordDto {
  @Field()
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty({ message: 'Token is required' })
  token: string;

  @Field()
  @IsNotEmpty({ message: 'Password is required' })
  newPassword: string;
}

@InputType()
export class AvatarInput {
  @Field(() => String, { nullable: true })
  url?: string;

  @Field(() => String, { nullable: true })
  public_id?: string;
}

@InputType()
export class UpdateProfileDto {
  @Field()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @Field(() => AvatarInput, { nullable: true })
  avatar?: AvatarInput;

  @Field(() => String, { nullable: true })
  jobName?: string;

  @Field(() => String, { nullable: true })
  bio?: string;

  @Field(() => String, { nullable: true })
  location?: string;
}
