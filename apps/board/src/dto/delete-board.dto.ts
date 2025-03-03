import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class DeleteBoardDto {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  boardId: string;
}
