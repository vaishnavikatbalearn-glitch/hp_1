import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { AppError, ErrorCode } from '../../types/errors';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import type { AuthUser, AuthSessionPayload } from './auth.types';
import type { Role } from '../../types';
import { generateOtp6Digits, storeOtpForUser } from './otp/otp.service';

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

export async function requestOtp(email: string): Promise<{ message: string }> {

  const normalizedEmail = email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, isActive: true },
  });

  if (!user) {
    return { message: 'If an account exists, an OTP has been sent.' };
  }

  if (!user.isActive) {
    throw AppError.unauthorized('Account disabled', ErrorCode.ACCOUNT_DISABLED);
  }

  const otp = generateOtp6Digits();
  await storeOtpForUser(user.id, otp, 10);

  return { message: 'OTP sent successfully' };

}

export async function resendOtp(email: string): Promise<{ message: string }> {
  return requestOtp(email);
}

export async function sendOtpToUser(userId: string): Promise<{ message: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isActive: true },
  });

  if (!user) {
    throw AppError.notFound('User');
  }

  if (!user.isActive) {
    throw AppError.unauthorized('Account disabled', ErrorCode.ACCOUNT_DISABLED);
  }

  const otp = generateOtp6Digits();
  await storeOtpForUser(user.id, otp, 10);

  return { message: 'OTP sent successfully' };
}

export async function resetUserPassword(userId: string, password: string): Promise<{ id: string; email: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });

  if (!user) {
    throw AppError.notFound('User');
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      isVerified: true,
      accountStatus: 'ACTIVE' as any,
      isActive: true,
      lastLoginAt: new Date(),
      activationToken: null,
      otpHash: null,
      otpExpiry: null,
      otpAttempts: 0,
    },
    select: { id: true, email: true },
  });

  return { id: updated.id, email: updated.email };
}

export async function verifyOtp(email: string, otp: string): Promise<AuthSessionPayload> {
  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      otpHash: true,
      otpAttempts: true,
      otpExpiry: true,
    },
  });

  if (!user) {
    throw AppError.unauthorized('Invalid OTP request', ErrorCode.INVALID_CREDENTIALS);
  }

  if (!user.isActive) {
    throw AppError.unauthorized('Account disabled', ErrorCode.ACCOUNT_DISABLED);
  }

  if (!user.otpHash || !user.otpExpiry || user.otpExpiry <= new Date()) {
    throw AppError.badRequest('OTP expired. Please request a new one.');
  }

  if (user.otpAttempts >= 5) {
    throw AppError.badRequest('Too many OTP attempts. Please request a new OTP.');
  }

  const isValidOtp = await bcrypt.compare(otp, user.otpHash);
  if (!isValidOtp) {
    const nextAttempts = Math.min((user.otpAttempts ?? 0) + 1, 5);
    await prisma.user.update({
      where: { id: user.id },
      data: { otpAttempts: nextAttempts },
    });

    throw AppError.badRequest(nextAttempts >= 5 ? 'Too many OTP attempts. Please request a new OTP.' : 'Invalid OTP');
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      // invalidate OTP after successful use
      otpHash: null,
      otpExpiry: null,
      otpAttempts: 0,
    },
    select: AUTH_USER_SELECT,
  });

  return buildSession({
    ...updated,
    lastLoginAt: new Date(),
  });
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

export async function loginUser(payload: { email: string; password?: string; otp?: string }): Promise<AuthSessionPayload> {
  if (payload.otp) {
    return verifyOtp(payload.email.toLowerCase(), payload.otp);
  }

  if (!payload.password) {
    throw AppError.badRequest('Either password or OTP is required');
  }

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

export async function activateStaffAccount(token: string, password: string): Promise<{ id: string; email: string }> {
  const user = await prisma.user.findFirst({
    where: {
      activationToken: token,
      accountStatus: 'PENDING_ACTIVATION',
    },
  });

  if (!user) {
    throw AppError.badRequest('Invalid or expired activation token');
  }

  // Reuse existing otpExpiry as the activation token expiry
  if (user.otpExpiry && user.otpExpiry <= new Date()) {
    throw AppError.badRequest('Activation token expired');
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      // Activation state (per your requirement)
      isVerified: true,
      accountStatus: 'ACTIVE',

      // Mark first login completed (project uses lastLoginAt as login marker)
      lastLoginAt: new Date(),

      // Invalidate activation token + any OTP state used during activation
      activationToken: null,
      otpHash: null,
      otpExpiry: null,
      otpAttempts: 0,

      isActive: true,
    },
    select: { id: true, email: true },
  });

  return { id: updated.id, email: updated.email };
}


export async function getAuthUserById(userId: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: AUTH_USER_SELECT });
  return user ? mapUser(user) : null;
}
