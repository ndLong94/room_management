import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  fetchAdminUsers,
  fetchAdminUserDetail,
  createUser as createUserApi,
  approveUser as approveUserApi,
  setUserStatus as setUserStatusApi,
  setPlatformPrice as setPlatformPriceApi,
  recordPlatformPayment as recordPlatformPaymentApi,
} from '@/api/admin'
import type { AdminUsersParams } from '@/api/admin'
import type { AdminUserDetail } from '@/types/user'

export function useAdminUsers(params?: AdminUsersParams) {
  return useQuery({
    queryKey: ['admin', 'users', params?.page ?? 0, params?.size ?? 10, params?.status],
    queryFn: () => fetchAdminUsers(params),
  })
}

export function useAdminUserDetail(userId: number | null) {
  return useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: () => fetchAdminUserDetail(userId!),
    enabled: userId != null,
  })
}

export function useSetPlatformPrice(userId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { amount: number; note?: string }) => setPlatformPriceApi(userId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      toast.success('Đã cập nhật giá')
    },
    onError: () => toast.error('Không thể cập nhật giá'),
  })
}

export function useRecordPlatformPayment(userId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { amount: number; paidAt?: string; note?: string }) =>
      recordPlatformPaymentApi(userId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      toast.success('Đã ghi nhận thanh toán')
    },
    onError: () => toast.error('Không thể ghi nhận thanh toán'),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { username: string; email: string; password: string }) =>
      createUserApi(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      toast.success('Đã tạo user')
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || 'Không thể tạo user')
    },
  })
}

export function useApproveUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) => approveUserApi(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      toast.success('Đã duyệt user')
    },
    onError: () => toast.error('Không thể duyệt'),
  })
}

export function useSetUserStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, status }: { userId: number; status: 'ACTIVE' | 'INACTIVE' }) =>
      setUserStatusApi(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      toast.success('Đã cập nhật trạng thái')
    },
    onError: () => toast.error('Không thể cập nhật'),
  })
}
