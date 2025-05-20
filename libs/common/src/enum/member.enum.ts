// src/task/priority.enum.ts
import { registerEnumType } from '@nestjs/graphql';

export enum Member {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN',
  VIEWER = 'VIEWER',
  OWNER = 'OWNER',
}

registerEnumType(Member, {
  name: 'Member',
  description: '',
});
