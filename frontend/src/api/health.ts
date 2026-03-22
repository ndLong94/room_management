import { api } from '@/lib/api'

export type HealthStatus = { status: string }

export async function getHealth(): Promise<HealthStatus> {
  const { data } = await api.get<HealthStatus>('/api/health')
  return data
}
