import { prisma } from '../../config/database';

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
