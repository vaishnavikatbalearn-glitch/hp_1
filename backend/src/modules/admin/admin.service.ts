import crypto from 'crypto';
import { prisma } from '../../config/database';
import { AppError, ErrorCode } from '../../types/errors';
import type { Role } from '../../types';
import { activateStaffAccount } from '../auth/auth.service';
import type { ActivateStaffBody, CreateStaffBody, UpdateStaffBody, UpdateStaffStatusBody } from './admin.validation';

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
    where: { role: { in: ['ADMIN', 'WARDEN', 'TRUSTEE', 'ACCOUNTANT', 'LAUNDRY_STAFF'] } },
    select: STAFF_SELECT,
    orderBy: { createdAt: 'desc' },
  });

  return users.map(mapStaffPayload);
}

export async function getStaffAccountById(id: string) {
  const user = await prisma.user.findFirst({
    where: { id, role: { in: ['ADMIN', 'WARDEN', 'TRUSTEE', 'ACCOUNTANT', 'LAUNDRY_STAFF'] } },
    select: STAFF_SELECT,
  });

  if (!user) {
    throw AppError.notFound('Staff account');
  }

  return mapStaffPayload(user);
}

export async function updateStaffAccount(id: string, payload: UpdateStaffBody) {
  const existing = await prisma.user.findFirst({
    where: { id, role: { in: ['ADMIN', 'WARDEN', 'TRUSTEE', 'ACCOUNTANT', 'LAUNDRY_STAFF'] } },
    select: { id: true, staffProfile: true },
  });

  if (!existing) {
    throw AppError.notFound('Staff account');
  }

  const data: Record<string, unknown> = {};
  if (payload.fullName !== undefined) data.fullName = payload.fullName;
  if (payload.email !== undefined) data.email = payload.email.toLowerCase();
  if (payload.phone !== undefined) data.phone = payload.phone;
  if (payload.role !== undefined) data.role = payload.role as unknown as Role;

  const updatedUser = await prisma.user.update({
    where: { id },
    data,
    select: STAFF_SELECT,
  });

  if (payload.hostelId !== undefined) {
    await prisma.staff.update({
      where: { userId: id },
      data: { hostelId: payload.hostelId },
    });
  }

  return mapStaffPayload(updatedUser);
}

export async function updateStaffStatus(id: string, payload: UpdateStaffStatusBody) {
  const existing = await prisma.user.findFirst({
    where: { id, role: { in: ['ADMIN', 'WARDEN', 'TRUSTEE', 'ACCOUNTANT', 'LAUNDRY_STAFF'] } },
    select: { id: true },
  });

  if (!existing) {
    throw AppError.notFound('Staff account');
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { accountStatus: payload.status as any },
    select: STAFF_SELECT,
  });

  return mapStaffPayload(updated);
}
