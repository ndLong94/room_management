import { api } from '@/lib/api'
import type {
  CreateRoomLeaseInput,
  RoomLease,
  UpdateRoomLeaseInput,
} from '@/types/roomLease'

export async function fetchRoomLeases(
  propertyId: number,
  roomId: number
): Promise<RoomLease[]> {
  const { data } = await api.get<RoomLease[]>(
    `/api/properties/${propertyId}/rooms/${roomId}/leases`
  )
  return data
}

export async function fetchActiveRoomLease(
  propertyId: number,
  roomId: number
): Promise<RoomLease | null> {
  const res = await api.get<RoomLease | undefined>(
    `/api/properties/${propertyId}/rooms/${roomId}/leases/active`,
    { validateStatus: (s) => s === 200 || s === 204 }
  )
  if (res.status === 204 || res.data == null) return null
  return res.data
}

export async function createRoomLease(
  propertyId: number,
  roomId: number,
  input: CreateRoomLeaseInput
): Promise<RoomLease> {
  const { data } = await api.post<RoomLease>(
    `/api/properties/${propertyId}/rooms/${roomId}/leases`,
    input
  )
  return data
}

export async function updateRoomLease(
  propertyId: number,
  roomId: number,
  leaseId: number,
  input: UpdateRoomLeaseInput
): Promise<RoomLease> {
  const { data } = await api.put<RoomLease>(
    `/api/properties/${propertyId}/rooms/${roomId}/leases/${leaseId}`,
    input
  )
  return data
}

export async function endRoomLease(
  propertyId: number,
  roomId: number,
  leaseId: number
): Promise<void> {
  await api.post(
    `/api/properties/${propertyId}/rooms/${roomId}/leases/${leaseId}/end`
  )
}
