import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { Member } from 'y/common/enum/member.enum';
@InputType()
export class AddMemberDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  boardId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @Field(() => Member)
  @IsString()
  role?: Member;
}
