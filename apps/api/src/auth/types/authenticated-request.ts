import { Request } from 'express';

export interface JwtUser {
  sub: string;
  email: string;
  role: string;
}

export type AuthenticatedRequest = Request & {
  user?: JwtUser;
};
