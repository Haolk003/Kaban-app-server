import { Field, InputType } from '@nestjs/graphql';
import { IsEmpty, IsString } from 'class-validator';

@InputType()
export class UpdateLabelDto {
  @Field()
  @IsString()
  @IsEmpty()
  name: string;
}
