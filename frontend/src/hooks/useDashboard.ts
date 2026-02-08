import { useQuery } from '@tanstack/react-query'
import { fetchDashboardSummary } from '@/api/dashboard'

export function useDashboardSummary(month: number, year: number) {
  return useQuery({
    queryKey: ['dashboard', 'summary', month, year],
    staleTime: 60 * 1000,
    queryFn: () => fetchDashboardSummary(month, year),
  })
}
