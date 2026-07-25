import { prisma } from '../../config/database';
import { AppError } from '../../types/errors';

export async function listRooms() {
  return prisma.room.findMany({
    select: {
      id: true,
      roomNumber: true,
      type: true,
      capacity: true,
      currentOccupancy: true,
      status: true,
      description: true,
      floorId: true,
      floor: {
        select: {
          id: true,
          number: true,
          name: true,
        },
      },
    },
    orderBy: [{ floor: { number: 'asc' } }, { roomNumber: 'asc' }],
  });
}

export async function listFloors() {
  const floors = await prisma.floor.findMany({
    where: { isActive: true },
    select: {
      id: true,
      number: true,
      name: true,
      isActive: true,
      rooms: {
        select: {
          id: true,
          roomNumber: true,
          capacity: true,
          currentOccupancy: true,
          status: true,
        },
      },
    },
    orderBy: { number: 'asc' },
  });

  return floors.map((floor) => ({
    ...floor,
    totalRooms: floor.rooms.length,
    occupiedRooms: floor.rooms.filter((room) => room.currentOccupancy > 0).length,
    availableRooms: floor.rooms.filter((room) => room.currentOccupancy < room.capacity).length,
  }));
}

export async function assignRoom(studentId: string, roomId: string) {
  const [student, room, existingAllocation] = await prisma.$transaction([
    prisma.student.findUnique({ where: { id: studentId } }),
    prisma.room.findUnique({ where: { id: roomId } }),
    prisma.roomAllocation.findUnique({ where: { studentId } }),
  ]);

  if (!student) throw AppError.notFound('Student');
  if (!room) throw AppError.notFound('Room');
  if (student.hostelId !== room.hostelId) {
    throw AppError.badRequest('Student and room do not belong to the same hostel');
  }

  if (existingAllocation?.status === 'ACTIVE') {
    throw AppError.conflict('Student already has an active room allocation');
  }

  return prisma.$transaction(async (tx) => {
    const incrementResult = await tx.room.updateMany({
      where: { id: roomId, currentOccupancy: { lt: room.capacity } },
      data: { currentOccupancy: { increment: 1 } },
    });

    if (incrementResult.count === 0) {
      throw AppError.conflict('Room is full');
    }

    return tx.roomAllocation.upsert({
      where: { studentId },
      create: {
        studentId,
        roomId,
        status: 'ACTIVE',
      },
      update: {
        roomId,
        status: 'ACTIVE',
        allocatedAt: new Date(),
        vacatedAt: null,
      },
    });
  });
}

export async function changeRoom(studentId: string, newRoomId: string) {
  const allocation = await prisma.roomAllocation.findUnique({
    where: { studentId },
    include: { room: true },
  });

  if (!allocation || allocation.status !== 'ACTIVE') {
    throw AppError.notFound('Active room allocation not found');
  }

  if (allocation.roomId === newRoomId) {
    throw AppError.conflict('Student is already assigned to this room');
  }

  const room = await prisma.room.findUnique({ where: { id: newRoomId } });
  if (!room) throw AppError.notFound('Room');

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw AppError.notFound('Student');
  if (student.hostelId !== room.hostelId) {
    throw AppError.badRequest('New room does not belong to the student hostel');
  }

  return prisma.$transaction(async (tx) => {
    const incrementResult = await tx.room.updateMany({
      where: { id: newRoomId, currentOccupancy: { lt: room.capacity } },
      data: { currentOccupancy: { increment: 1 } },
    });

    if (incrementResult.count === 0) {
      throw AppError.conflict('Room is full');
    }

    await tx.room.updateMany({
      where: { id: allocation.roomId, currentOccupancy: { gt: 0 } },
      data: { currentOccupancy: { decrement: 1 } },
    });

    return tx.roomAllocation.update({
      where: { studentId },
      data: {
        roomId: newRoomId,
        status: 'ACTIVE',
        updatedAt: new Date(),
      },
    });
  });
}
