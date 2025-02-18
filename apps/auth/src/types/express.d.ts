// src/types/express.d.ts

// import { User } from '@prisma/client';

declare module 'express' {
  interface Request {
    accesstoken?: string;
    refreshtoken?: string;
    user?: any;
    body?: any;
  }
}
