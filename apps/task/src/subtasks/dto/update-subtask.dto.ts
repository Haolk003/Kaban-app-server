import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateSubTaskDto {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isCompleted?: boolean;
}
