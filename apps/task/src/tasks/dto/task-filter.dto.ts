// src/task/dto/task-filter.input.ts
import { InputType, Field } from '@nestjs/graphql';
import { Priority } from 'y/common/enum/priority.enum';

@InputType()
export class DateRangeInput {
  @Field(() => Date, { description: 'Ngày bắt đầu' })
  start: Date;

  @Field(() => Date, { nullable: true, description: 'Ngày kết thúc' })
  end?: Date;
}

@InputType()
export class TaskFilterInput {
  @Field({
    nullable: true,
    description: 'Tìm kiếm theo title hoặc description',
  })
  search?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Lọc theo trạng thái task',
  })
  status?: string;

  @Field(() => Priority, { nullable: true, description: 'Lọc theo độ ưu tiên' })
  priority?: Priority;

  @Field(() => [String], {
    nullable: true,
    description: 'Lọc theo danh sách label IDs',
  })
  labels?: string[];

  @Field(() => [String], {
    nullable: true,
    description: 'Lọc theo danh sách user được assign',
  })
  assignedTo?: string[];

  @Field(() => DateRangeInput, {
    nullable: true,
    description: 'Lọc theo khoảng thời gian due date',
  })
  dueDate?: DateRangeInput;

  @Field(() => String, { defaultValue: 'CREATED_AT_ASC' })
  sortBy: string;
}

// File date-range.input.ts
