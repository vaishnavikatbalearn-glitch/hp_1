import crypto from 'crypto';
import bcrypt from 'bcryptjs';

import { prisma } from '../../../config/database';
import { env } from '../../../config/env';

const DEFAULT_OTP_TTL_MINUTES = 10;

export function generateOtp6Digits(): string {
  // Ensure exactly 6 digits (allow leading zeros)
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, env.BCRYPT_ROUNDS);
}

export function getOtpExpiryDate(minutes: number = DEFAULT_OTP_TTL_MINUTES): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export async function storeOtpForUser(userId: string, otp: string, expiresInMinutes: number = DEFAULT_OTP_TTL_MINUTES): Promise<void> {
  const otpHash = await hashOtp(otp);
  const otpExpiry = getOtpExpiryDate(expiresInMinutes);

  await prisma.user.update({
    where: { id: userId },
    data: {
      otpHash,
      otpExpiry,
      otpAttempts: 0,
    },
  });
}

