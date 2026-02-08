import { api } from '@/lib/api'
import type { DashboardSummary } from '@/types/dashboard'

export async function fetchDashboardSummary(month: number, year: number): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>('/api/dashboard/summary', {
    params: { month, year },
  })
  return data
}
