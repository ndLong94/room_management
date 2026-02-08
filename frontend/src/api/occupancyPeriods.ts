import { api } from '@/lib/api'
import type { OccupancyPeriod, OccupancyPeriodOccupant } from '@/types/occupancyPeriod'

export async function fetchOccupancyPeriods(
  propertyId: number,
  roomId: number
): Promise<OccupancyPeriod[]> {
  const { data } = await api.get<OccupancyPeriod[]>(
    `/api/properties/${propertyId}/rooms/${roomId}/occupancy-periods`
  )
  return data
}

export async function fetchOccupancyPeriodOccupants(
  propertyId: number,
  roomId: number,
  periodId: number
): Promise<OccupancyPeriodOccupant[]> {
  const { data } = await api.get<OccupancyPeriodOccupant[]>(
    `/api/properties/${propertyId}/rooms/${roomId}/occupancy-periods/${periodId}/occupants`
  )
  return data
}
