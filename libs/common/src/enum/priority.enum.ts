// src/task/priority.enum.ts
import { registerEnumType } from '@nestjs/graphql';

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

registerEnumType(Priority, {
  name: 'Priority',
  description: 'Độ ưu tiên của công việc',
});
