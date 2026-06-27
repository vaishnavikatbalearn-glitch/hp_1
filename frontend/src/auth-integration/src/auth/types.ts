/**
 * Shared auth types. Adjust `Role` and `User` fields to exactly match
 * your backend's response shape.
 */

export type Role = 'ADMIN' | 'MANAGER' | 'USER'; // <-- update to match your backend's role enum

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
  // Note: no refreshToken field here — it is set by the backend as an
  // httpOnly cookie and is never exposed to client-side JS.
}
