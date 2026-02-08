import { api } from '@/lib/api'
import type { User } from '@/types/user'

export async function updateProfile(body: { email: string }): Promise<User> {
  const { data } = await api.put<User>('/api/auth/me', body)
  return data
}
