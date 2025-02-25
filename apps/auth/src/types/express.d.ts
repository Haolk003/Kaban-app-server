import 'express';

interface UserGoogle {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
}
declare global {
  namespace Express {
    interface Request {
      user?: UserGoogle;
      me?: unknown;
      usergoogle?: UserGoogle;
    }
  }
}
