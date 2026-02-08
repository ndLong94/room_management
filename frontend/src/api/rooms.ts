import { api } from '@/lib/api'
import type { CreateRoomInput, Room, RoomStatus, UpdateRoomInput } from '@/types/room'

export async function fetchRooms(propertyId: number): Promise<Room[]> {
  const { data } = await api.get<Room[]>(`/api/properties/${propertyId}/rooms`)
  return data
}

export async function fetchRoom(propertyId: number, roomId: number): Promise<Room> {
  const { data } = await api.get<Room>(`/api/properties/${propertyId}/rooms/${roomId}`)
  return data
}

export async function createRoom(propertyId: number, input: CreateRoomInput): Promise<Room> {
  const { data } = await api.post<Room>(`/api/properties/${propertyId}/rooms`, {
    ...input,
    rentPrice: input.rentPrice ?? 0,
  })
  return data
}

export async function updateRoom(
  propertyId: number,
  roomId: number,
  input: UpdateRoomInput
): Promise<Room> {
  const { data } = await api.put<Room>(`/api/properties/${propertyId}/rooms/${roomId}`, input)
  return data
}

export async function deleteRoom(propertyId: number, roomId: number): Promise<void> {
  await api.delete(`/api/properties/${propertyId}/rooms/${roomId}`)
}

export const ROOM_STATUSES: RoomStatus[] = ['VACANT', 'OCCUPIED']
