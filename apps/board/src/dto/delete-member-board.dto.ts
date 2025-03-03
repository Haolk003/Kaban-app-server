import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class DeleteMemberBoardDto {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  boardId: string;

  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  memberId: string;
}
