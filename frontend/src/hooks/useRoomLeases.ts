import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getErrorMessageVi } from '@/utils'
import {
  createRoomLease,
  endRoomLease,
  fetchActiveRoomLease,
  fetchRoomLeases,
  updateRoomLease,
} from '@/api/roomLeases'
import type {
  CreateRoomLeaseInput,
  UpdateRoomLeaseInput,
} from '@/types/roomLease'

const roomLeasesKey = (propertyId: number, roomId: number) =>
  ['roomLeases', propertyId, roomId] as const

const activeLeaseKey = (propertyId: number, roomId: number) =>
  ['roomLeases', 'active', propertyId, roomId] as const

export function useRoomLeases(propertyId: number | null, roomId: number | null) {
  return useQuery({
    queryKey: roomLeasesKey(propertyId!, roomId!),
    queryFn: () => fetchRoomLeases(propertyId!, roomId!),
    enabled: propertyId != null && roomId != null,
  })
}

export function useActiveRoomLease(
  propertyId: number | null,
  roomId: number | null
) {
  return useQuery({
    queryKey: activeLeaseKey(propertyId!, roomId!),
    queryFn: () => fetchActiveRoomLease(propertyId!, roomId!),
    enabled: propertyId != null && roomId != null,
  })
}

export function useCreateRoomLease(propertyId: number, roomId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateRoomLeaseInput) =>
      createRoomLease(propertyId, roomId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomLeasesKey(propertyId, roomId) })
      queryClient.invalidateQueries({ queryKey: activeLeaseKey(propertyId, roomId) })
      toast.success('Đã tạo hợp đồng thuê')
    },
    onError: (err: unknown) => toast.error(getErrorMessageVi(err, 'Không thể tạo hợp đồng thuê')),
  })
}

export function useUpdateRoomLease(propertyId: number, roomId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      leaseId,
      input,
    }: {
      leaseId: number
      input: UpdateRoomLeaseInput
    }) => updateRoomLease(propertyId, roomId, leaseId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomLeasesKey(propertyId, roomId) })
      queryClient.invalidateQueries({ queryKey: activeLeaseKey(propertyId, roomId) })
      toast.success('Đã cập nhật hợp đồng thuê')
    },
    onError: (err: unknown) => toast.error(getErrorMessageVi(err, 'Không thể cập nhật hợp đồng thuê')),
  })
}

export function useEndRoomLease(propertyId: number, roomId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (leaseId: number) => endRoomLease(propertyId, roomId, leaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomLeasesKey(propertyId, roomId) })
      queryClient.invalidateQueries({ queryKey: activeLeaseKey(propertyId, roomId) })
      toast.success('Đã kết thúc hợp đồng thuê')
    },
    onError: (err: unknown) => toast.error(getErrorMessageVi(err, 'Không thể kết thúc hợp đồng thuê')),
  })
}
