import type { Role } from '../../types';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponsePayload {
  accessToken: string;
  user: AuthUser;
}

export interface AuthSessionPayload extends AuthResponsePayload {
  refreshToken: string;
}
