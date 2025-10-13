import { Request } from 'express';

export interface JwtPayload {
  id: number;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface RequestWithUser extends Request {
  user: JwtPayload; // or any other type of your decoded user
}
