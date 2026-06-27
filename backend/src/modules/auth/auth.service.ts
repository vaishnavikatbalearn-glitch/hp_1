import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { AppError, ErrorCode } from '../../types/errors';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import type { AuthUser, AuthSessionPayload } from './auth.types';
import type { Role } from '../../types';

const AUTH_USER_SELECT = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

function mapUser(user: any): AuthUser {
  return {
    id: user.id,
    name: (user as any).fullName as string,
    email: user.email,
    role: (user.role as unknown) as Role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function getRefreshTokenExpiryFromJwt(token: string): Date {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  if (!decoded?.exp) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return new Date(decoded.exp * 1000);
}

async function createRefreshTokenRecord(userId: string, jti: string, expiresAt: Date): Promise<void> {
  await prisma.refreshToken.create({ data: { jti, userId, expiresAt } });
}

async function buildSession(user: any): Promise<AuthSessionPayload> {
  const accessToken = signAccessToken({ userId: user.id, role: (user.role as unknown) as Role });
  const { token: refreshToken, jti } = signRefreshToken(user.id);
  const expiresAt = getRefreshTokenExpiryFromJwt(refreshToken);
  await createRefreshTokenRecord(user.id, jti, expiresAt);

  return {
    accessToken,
    refreshToken,
    user: mapUser(user),
  };
}

export async function registerUser(payload: { name: string; email: string; password: string }): Promise<AuthSessionPayload> {
  const existing = await prisma.user.findUnique({ where: { email: payload.email.toLowerCase() } });
  if (existing) {
    throw AppError.conflict('Email is already registered', ErrorCode.EMAIL_ALREADY_EXISTS);
  }

  const hashed = await bcrypt.hash(payload.password, env.BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      fullName: payload.name,
      email: payload.email.toLowerCase(),
      passwordHash: hashed,
      role: 'STUDENT',
      isActive: true,
    } as any,
  });

  return buildSession(user);
}

export async function loginUser(payload: { email: string; password: string }): Promise<AuthSessionPayload> {
  const user = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() },
    select: { ...AUTH_USER_SELECT, passwordHash: true },
  });

  if (!user) throw AppError.unauthorized('Invalid email or password', ErrorCode.INVALID_CREDENTIALS);
  if (!user.isActive) throw AppError.unauthorized('Account disabled', ErrorCode.ACCOUNT_DISABLED);

  const ok = await bcrypt.compare(payload.password, (user as any).passwordHash as string);
  if (!ok) throw AppError.unauthorized('Invalid email or password', ErrorCode.INVALID_CREDENTIALS);

  const updated = await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() }, select: AUTH_USER_SELECT });
  return buildSession(updated);
}

export async function refreshSession(refreshToken: string): Promise<AuthSessionPayload> {
  const payload = verifyRefreshToken(refreshToken);

  const existing = await prisma.refreshToken.findUnique({ where: { jti: payload.jti }, include: { user: true } });
  if (!existing || existing.revokedAt || existing.expiresAt <= new Date()) {
    throw AppError.unauthorized('Refresh token invalid', ErrorCode.REFRESH_TOKEN_INVALID);
  }

  if (!existing.user.isActive) throw AppError.unauthorized('Account disabled', ErrorCode.ACCOUNT_DISABLED);

  const { token: nextToken, jti: nextJti } = signRefreshToken(existing.user.id);
  const nextExpiresAt = getRefreshTokenExpiryFromJwt(nextToken);

  await prisma.$transaction([
    prisma.refreshToken.update({ where: { jti: payload.jti }, data: { revokedAt: new Date() } }),
    prisma.refreshToken.create({ data: { jti: nextJti, userId: existing.user.id, expiresAt: nextExpiresAt } }),
  ]);

  return {
    accessToken: signAccessToken({ userId: existing.user.id, role: (existing.user.role as unknown) as Role }),
    refreshToken: nextToken,
    user: mapUser(existing.user),
  };
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  const payload = verifyRefreshToken(refreshToken);
  await prisma.refreshToken.updateMany({ where: { jti: payload.jti, revokedAt: null }, data: { revokedAt: new Date() } });
}

export async function getAuthUserById(userId: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: AUTH_USER_SELECT });
  return user ? mapUser(user) : null;
}
