// src/common/dto/pagination.input.ts
import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { IsOptional, IsInt, Min, IsArray } from 'class-validator';

export enum OrderDirection {
  ASC = 'asc',
  DESC = 'desc',
}

registerEnumType(OrderDirection, {
  name: 'OrderDirection',
  description: 'Sort direction (asc/desc)',
});

@InputType()
export class OrderByInput {
  @Field()
  field: string;

  @Field(() => OrderDirection)
  direction: OrderDirection;
}

@InputType()
export class PaginationInput {
  @Field({ nullable: true, description: 'Number of items to skip' })
  @IsOptional()
  @IsInt()
  @Min(0)
  skip?: number;

  @Field({ nullable: true, description: 'Number of items to take' })
  @IsOptional()
  @IsInt()
  @Min(1)
  take?: number;

  @Field({ nullable: true, description: 'Cursor for cursor-based pagination' })
  @IsOptional()
  cursor?: string;

  @Field(() => [OrderByInput], {
    nullable: true,
    description: 'Sorting criteria',
    defaultValue: [{ field: 'createdAt', direction: OrderDirection.DESC }],
  })
  @IsOptional()
  @IsArray()
  orderBy?: OrderByInput[];
}
