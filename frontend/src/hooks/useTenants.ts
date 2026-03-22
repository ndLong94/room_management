import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getErrorMessageVi } from '@/utils'
import {
  createTenant,
  deleteTenant,
  fetchTenant,
  fetchTenants,
  updateTenant,
} from '@/api/tenants'
import type { CreateTenantInput, UpdateTenantInput } from '@/types/tenant'

const tenantsKey = ['tenants'] as const

export function useTenants() {
  return useQuery({
    queryKey: tenantsKey,
    queryFn: fetchTenants,
  })
}

export function useTenant(tenantId: number | null) {
  return useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: () => fetchTenant(tenantId!),
    enabled: tenantId != null,
  })
}

export function useCreateTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTenantInput) => createTenant(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantsKey })
      toast.success('Đã thêm người thuê')
    },
    onError: (err: unknown) => toast.error(getErrorMessageVi(err, 'Không thể thêm người thuê')),
  })
}

export function useUpdateTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateTenantInput }) =>
      updateTenant(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantsKey })
      toast.success('Đã cập nhật người thuê')
    },
    onError: (err: unknown) => toast.error(getErrorMessageVi(err, 'Không thể cập nhật người thuê')),
  })
}

export function useDeleteTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantsKey })
      toast.success('Đã xóa người thuê')
    },
    onError: (err: unknown) => toast.error(getErrorMessageVi(err, 'Không thể xóa người thuê')),
  })
}
