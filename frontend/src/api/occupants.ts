import { api } from '@/lib/api'
import type { CreateOccupantInput, Occupant, UpdateOccupantInput } from '@/types/occupant'

export async function fetchOccupants(propertyId: number, roomId: number): Promise<Occupant[]> {
  const { data } = await api.get<Occupant[]>(
    `/api/properties/${propertyId}/rooms/${roomId}/occupants`
  )
  return data
}

export async function fetchOccupant(id: number): Promise<Occupant> {
  const { data } = await api.get<Occupant>(`/api/occupants/${id}`)
  return data
}

export async function createOccupant(
  propertyId: number,
  roomId: number,
  input: CreateOccupantInput
): Promise<Occupant> {
  const { data } = await api.post<Occupant>(
    `/api/properties/${propertyId}/rooms/${roomId}/occupants`,
    input
  )
  return data
}

export async function updateOccupant(id: number, input: UpdateOccupantInput): Promise<Occupant> {
  const { data } = await api.put<Occupant>(`/api/occupants/${id}`, input)
  return data
}

export async function deleteOccupant(id: number): Promise<void> {
  await api.delete(`/api/occupants/${id}`)
}
