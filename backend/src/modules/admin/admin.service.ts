import crypto from 'crypto';
import { prisma } from '../../config/database';
import { AppError, ErrorCode } from '../../types/errors';
import type { Role } from '../../types';
import { activateStaffAccount, resetUserPassword, sendOtpToUser } from '../auth/auth.service';
import type { ActivateStaffBody, CreateStaffBody, ResetStaffPasswordBody, UpdateStaffBody, UpdateStaffStatusBody } from './admin.validation';

const STAFF_SELECT = {
  id: true,
  email: true,
  phone: true,
  role: true,
  fullName: true,
  accountStatus: true,
  activationToken: true,
  otpExpiry: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  staffProfile: {
    select: {
      id: true,
      hostelId: true,
      employeeCode: true,
      designation: true,
      isActive: true,
    },
  },
} as const;

const STAFF_ROLES = ['ADMIN', 'WARDEN', 'TRUSTEE', 'ACCOUNTANT', 'LAUNDRY_STAFF'] as const;

function makeActivationToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

function mapStaffPayload(user: any) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    mobileNumber: user.phone,
    role: user.role,
    hostelAssignment: user.staffProfile?.hostelId ?? null,
    status: user.accountStatus,
    createdBy: user.createdById,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    activationToken: user.activationToken,
    otpExpiry: user.otpExpiry,
    employeeCode: user.staffProfile?.employeeCode ?? null,
  };
}

export async function createStaffAccount(actorId: string, payload: CreateStaffBody) {
  const actor = await prisma.user.findUnique({ where: { id: actorId } });
  if (!actor || actor.role !== 'SUPER_ADMIN') {
    throw AppError.forbidden('Only SUPER_ADMIN can create staff accounts');
  }

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email: payload.email.toLowerCase() }, { phone: payload.phone }] },
  });

  if (existingUser) {
    throw AppError.conflict('A user with this email or mobile already exists', ErrorCode.CONFLICT);
  }

  const hostel = await prisma.hostel.findUnique({ where: { id: payload.hostelId } });
  if (!hostel) {
    throw AppError.notFound('Hostel');
  }

  const activationToken = makeActivationToken();
  const activationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await prisma.user.create({
    data: {
      email: payload.email.toLowerCase(),
      phone: payload.phone,
      passwordHash: crypto.randomBytes(32).toString('hex'),
      role: payload.role as unknown as Role,
      fullName: payload.fullName,
      isActive: false,
      isVerified: false,
      accountStatus: 'PENDING_ACTIVATION' as any,
      activationToken,
      otpExpiry: activationExpiry,
      createdById: actorId,
    },
    select: STAFF_SELECT,
  });

  await sendOtpToUser(user.id);

  const employeeCode = `STF-${Date.now().toString().slice(-6)}`;
  await prisma.staff.create({
    data: {
      userId: user.id,
      hostelId: payload.hostelId,
      employeeCode,
      firstName: payload.fullName.split(' ')[0] ?? payload.fullName,
      lastName: payload.fullName.split(' ').slice(1).join(' ') || 'Staff',
      gender: 'OTHER',
      phone: payload.phone,
      designation: payload.role,
      joiningDate: new Date(),
      isActive: false,
    },
  });

  return {
    staff: mapStaffPayload(user),
    activationToken,
    activationExpiresAt: activationExpiry.toISOString(),
  };
}

export async function activateStaffAccountByToken(payload: ActivateStaffBody) {
  return activateStaffAccount(payload.token, payload.password);
}

export async function listStaffAccounts() {
  const users = await prisma.user.findMany({
    where: { role: { in: STAFF_ROLES as unknown as Role[] } },
    select: STAFF_SELECT,
    orderBy: { createdAt: 'desc' },
  });

  return users.map(mapStaffPayload);
}

export async function getStaffAccountById(id: string) {
  const user = await prisma.user.findFirst({
    where: { id, role: { in: STAFF_ROLES as unknown as Role[] } },
    select: STAFF_SELECT,
  });

  if (!user) {
    throw AppError.notFound('Staff account');
  }

  return mapStaffPayload(user);
}

export async function updateStaffAccount(id: string, payload: UpdateStaffBody) {
  const existing = await prisma.user.findFirst({
    where: { id, role: { in: STAFF_ROLES as unknown as Role[] } },
    select: { id: true, staffProfile: true },
  });

  if (!existing) {
    throw AppError.notFound('Staff account');
  }

  if (payload.email !== undefined) {
    const existingEmail = await prisma.user.findFirst({
      where: {
        email: payload.email.toLowerCase(),
        id: { not: id },
      },
    });
    if (existingEmail) {
      throw AppError.conflict('Email is already in use', ErrorCode.CONFLICT);
    }
  }

  if (payload.phone !== undefined) {
    const existingPhone = await prisma.user.findFirst({
      where: {
        phone: payload.phone,
        id: { not: id },
      },
    });
    if (existingPhone) {
      throw AppError.conflict('Phone number is already in use', ErrorCode.CONFLICT);
    }
  }

  const userData: Record<string, unknown> = {};
  const staffData: Record<string, unknown> = {};

  if (payload.fullName !== undefined) {
    userData.fullName = payload.fullName;
    const [firstName, ...remaining] = payload.fullName.trim().split(' ');
    staffData.firstName = firstName;
    staffData.lastName = remaining.join(' ') || 'Staff';
  }
  if (payload.email !== undefined) userData.email = payload.email.toLowerCase();
  if (payload.phone !== undefined) {
    userData.phone = payload.phone;
    staffData.phone = payload.phone;
  }
  if (payload.role !== undefined) {
    userData.role = payload.role as unknown as Role;
    staffData.designation = payload.role;
  }
  if (payload.hostelId !== undefined) {
    staffData.hostelId = payload.hostelId;
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: userData,
    select: STAFF_SELECT,
  });

  if (Object.keys(staffData).length > 0) {
    await prisma.staff.update({
      where: { userId: id },
      data: staffData,
    });
  }

  return mapStaffPayload(updatedUser);
}

export async function updateStaffStatus(id: string, payload: UpdateStaffStatusBody) {
  const existing = await prisma.user.findFirst({
    where: { id, role: { in: STAFF_ROLES as unknown as Role[] } },
    select: { id: true },
  });

  if (!existing) {
    throw AppError.notFound('Staff account');
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      accountStatus: payload.status as any,
      isActive: payload.status === 'ACTIVE',
    },
    select: STAFF_SELECT,
  });

  await prisma.staff.update({
    where: { userId: id },
    data: { isActive: payload.status === 'ACTIVE' },
  });

  return mapStaffPayload(updated);
}

export async function disableStaffAccount(id: string) {
  const existing = await prisma.user.findFirst({
    where: { id, role: { in: STAFF_ROLES as unknown as Role[] } },
    select: { id: true },
  });

  if (!existing) {
    throw AppError.notFound('Staff account');
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: false, accountStatus: 'SUSPENDED' as any },
    select: STAFF_SELECT,
  });

  await prisma.staff.update({
    where: { userId: id },
    data: { isActive: false },
  });

  return mapStaffPayload(updated);
}

export async function enableStaffAccount(id: string) {
  const existing = await prisma.user.findFirst({
    where: { id, role: { in: STAFF_ROLES as unknown as Role[] } },
    select: { id: true },
  });

  if (!existing) {
    throw AppError.notFound('Staff account');
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: true, accountStatus: 'ACTIVE' as any },
    select: STAFF_SELECT,
  });

  return mapStaffPayload(updated);
}

export async function sendStaffOtp(id: string) {
  const existing = await prisma.user.findFirst({
    where: { id, role: { in: STAFF_ROLES as unknown as Role[] } },
    select: { id: true },
  });

  if (!existing) {
    throw AppError.notFound('Staff account');
  }

  return sendOtpToUser(id);
}

export async function resetStaffPassword(id: string, payload: ResetStaffPasswordBody) {
  const existing = await prisma.user.findFirst({
    where: { id, role: { in: STAFF_ROLES as unknown as Role[] } },
    select: { id: true },
  });

  if (!existing) {
    throw AppError.notFound('Staff account');
  }

  return resetUserPassword(id, payload.password, payload.otp);
}
