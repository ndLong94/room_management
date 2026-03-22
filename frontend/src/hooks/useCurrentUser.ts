import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from '@/api/auth'
import type { User } from '@/types/user'

export function useCurrentUser() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  const query = useQuery({
    queryKey: ['me'],
    queryFn: async (): Promise<User> => getCurrentUser(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  })
  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}
