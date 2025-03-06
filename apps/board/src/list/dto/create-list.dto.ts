import { Field, ID, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class CreateListDto {
  @Field()
  @IsString()
  name: string;

  @Field(() => ID)
  @IsString()
  boardId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  status?: string;
}
