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
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(3, { message: 'Name must be at least 3 characters' })
  @IsString({ message: 'Name must need to be one string' })
  name: string;

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
