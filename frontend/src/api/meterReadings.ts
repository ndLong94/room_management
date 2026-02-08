import { api } from '@/lib/api'

export interface MeterReadingInput {
  month: number
  year: number
  elecReading: number
  waterReading: number
}

export interface MeterReading {
  id: number
  roomId: number
  month: number
  year: number
  elecReading: number
  waterReading: number
}

export async function getMeterReading(
  propertyId: number,
  roomId: number,
  month: number,
  year: number
): Promise<MeterReading | null> {
  try {
    const { data } = await api.get<MeterReading>(
      `/api/properties/${propertyId}/rooms/${roomId}/meter-readings`,
      { params: { month, year } }
    )
    return data
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'response' in err) {
      const ax = err as { response?: { status?: number } }
      if (ax.response?.status === 404) return null
    }
    throw err
  }
}

export async function createMeterReading(
  propertyId: number,
  roomId: number,
  input: MeterReadingInput
): Promise<MeterReading> {
  const { data } = await api.post<MeterReading>(
    `/api/properties/${propertyId}/rooms/${roomId}/meter-readings`,
    input
  )
  return data
}
