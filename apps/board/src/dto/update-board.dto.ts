import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class UpdateBoardDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @Field()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
