/**
 * Prisma Seed — HostelPaglu
 * Run: npm run prisma:seed
 *
 * Creates a minimal set of seed data:
 * - 1 Super Admin user
 * - 1 Sample Hostel
 * - 1 Admin + 1 Warden user for that hostel
 */

import { PrismaClient, Role, Gender } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;

async function hash(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function main(): Promise<void> {
  console.log('🌱 Seeding database…');

  // ── Super Admin ─────────────────────────────────────────────────────────────
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@hostelpaglu.com' },
    update: {},
    create: {
      email: 'superadmin@hostelpaglu.com',
      phone: '+91-9000000001',
      passwordHash: await hash('SuperAdmin@123'),
      role: Role.SUPER_ADMIN,
      isActive: true,
      isVerified: true,
    },
  });
  console.log(`✅ Super Admin: ${superAdmin.email}`);

  // ── Sample Hostel ────────────────────────────────────────────────────────────
  const hostel = await prisma.hostel.upsert({
    where: { code: 'BH-01' },
    update: {},
    create: {
      name: 'Gandhi Boys Hostel',
      code: 'BH-01',
      address: '123, University Road',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pinCode: '380015',
      gender: Gender.MALE,
      totalRooms: 100,
      totalFloors: 5,
    },
  });
  console.log(`✅ Hostel: ${hostel.name} (${hostel.code})`);

  // ── Admin ────────────────────────────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@hostelpaglu.com' },
    update: {},
    create: {
      email: 'admin@hostelpaglu.com',
      phone: '+91-9000000002',
      passwordHash: await hash('Admin@123'),
      role: Role.ADMIN,
      isActive: true,
      isVerified: true,
    },
  });

  await prisma.staff.upsert({
    where: { employeeCode: 'EMP-001' },
    update: {},
    create: {
      userId: adminUser.id,
      hostelId: hostel.id,
      employeeCode: 'EMP-001',
      firstName: 'Rajan',
      lastName: 'Mehta',
      gender: Gender.MALE,
      phone: '+91-9000000002',
      designation: 'Hostel Administrator',
    },
  });
  console.log(`✅ Admin: ${adminUser.email}`);

  // ── Warden ───────────────────────────────────────────────────────────────────
  const wardenUser = await prisma.user.upsert({
    where: { email: 'warden@hostelpaglu.com' },
    update: {},
    create: {
      email: 'warden@hostelpaglu.com',
      phone: '+91-9000000003',
      passwordHash: await hash('Warden@123'),
      role: Role.WARDEN,
      isActive: true,
      isVerified: true,
    },
  });

  await prisma.staff.upsert({
    where: { employeeCode: 'EMP-002' },
    update: {},
    create: {
      userId: wardenUser.id,
      hostelId: hostel.id,
      employeeCode: 'EMP-002',
      firstName: 'Suresh',
      lastName: 'Patel',
      gender: Gender.MALE,
      phone: '+91-9000000003',
      designation: 'Warden',
    },
  });
  console.log(`✅ Warden: ${wardenUser.email}`);

  // ── Floor ─────────────────────────────────────────────────────────────────
  const floor1 = await prisma.floor.upsert({
    where: { hostelId_number: { hostelId: hostel.id, number: 1 } },
    update: {},
    create: {
      hostelId: hostel.id,
      number: 1,
      name: 'First Floor',
    },
  });

  // ── Sample Room ───────────────────────────────────────────────────────────
  await prisma.room.upsert({
    where: { hostelId_roomNumber: { hostelId: hostel.id, roomNumber: '101' } },
    update: {},
    create: {
      hostelId: hostel.id,
      floorId: floor1.id,
      roomNumber: '101',
      type: 'DOUBLE',
      capacity: 2,
      pricePerMonth: 5000,
      amenities: ['Bed', 'Study Table', 'Fan', 'Cupboard'],
    },
  });
  console.log('✅ Sample room created (101)');

  console.log('\n🎉 Seed complete!');
  console.log('\nDefault credentials:');
  console.log('  Super Admin: superadmin@hostelpaglu.com / SuperAdmin@123');
  console.log('  Admin:       admin@hostelpaglu.com / Admin@123');
  console.log('  Warden:      warden@hostelpaglu.com / Warden@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
