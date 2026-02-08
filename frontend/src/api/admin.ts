import { api } from '@/lib/api'
import type { AdminUserDetail, AdminUserListItem, PagedResponse, User } from '@/types/user'

export interface AdminUsersParams {
  page?: number
  size?: number
  status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE'
}

export async function fetchAdminUsers(params?: AdminUsersParams): Promise<PagedResponse<AdminUserListItem>> {
  const { data } = await api.get<PagedResponse<AdminUserListItem>>('/api/admin/users', {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      sort: 'createdAt,desc',
      ...(params?.status && { status: params.status }),
    },
  })
  return data
}

export async function createUser(body: {
  username: string
  email: string
  password: string
}): Promise<User> {
  const { data } = await api.post<User>('/api/admin/users', body)
  return data
}

export async function approveUser(userId: number): Promise<void> {
  await api.post(`/api/admin/users/${userId}/approve`)
}

export async function setUserStatus(
  userId: number,
  status: 'ACTIVE' | 'INACTIVE'
): Promise<void> {
  await api.put(`/api/admin/users/${userId}/status`, { status })
}

export async function fetchAdminUserDetail(userId: number): Promise<AdminUserDetail> {
  const { data } = await api.get<AdminUserDetail>(`/api/admin/users/${userId}`)
  return data
}

export async function setPlatformPrice(
  userId: number,
  body: { amount: number; note?: string }
): Promise<void> {
  await api.put(`/api/admin/users/${userId}/platform-price`, body)
}

export async function recordPlatformPayment(
  userId: number,
  body: { amount: number; paidAt?: string; note?: string }
): Promise<{ id: number; amount: string; paidAt: string; note: string | null }> {
  const { data } = await api.post(`/api/admin/users/${userId}/platform-payments`, body)
  return data
}
