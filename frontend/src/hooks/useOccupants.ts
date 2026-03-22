import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getErrorMessageVi } from '@/utils'
import {
  createOccupant,
  deleteOccupant,
  fetchOccupant,
  fetchOccupants,
  updateOccupant,
} from '@/api/occupants'
import type { CreateOccupantInput, UpdateOccupantInput } from '@/types/occupant'

const occupantsKey = (propertyId: number, roomId: number) =>
  ['occupants', propertyId, roomId] as const

export function useOccupants(propertyId: number | null, roomId: number | null) {
  return useQuery({
    queryKey: occupantsKey(propertyId!, roomId!),
    queryFn: () => fetchOccupants(propertyId!, roomId!),
    enabled: propertyId != null && roomId != null,
  })
}

export function useOccupant(occupantId: number | null) {
  return useQuery({
    queryKey: ['occupant', occupantId],
    queryFn: () => fetchOccupant(occupantId!),
    enabled: occupantId != null,
  })
}

export function useCreateOccupant(propertyId: number, roomId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateOccupantInput) => createOccupant(propertyId, roomId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: occupantsKey(propertyId, roomId) })
      toast.success('Đã thêm người ở')
    },
    onError: (err: unknown) => toast.error(getErrorMessageVi(err, 'Không thể thêm người ở')),
  })
}

export function useUpdateOccupant(propertyId: number, roomId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateOccupantInput }) =>
      updateOccupant(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: occupantsKey(propertyId, roomId) })
      toast.success('Đã cập nhật người ở')
    },
    onError: (err: unknown) => toast.error(getErrorMessageVi(err, 'Không thể cập nhật người ở')),
  })
}

export function useDeleteOccupant(propertyId: number, roomId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteOccupant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: occupantsKey(propertyId, roomId) })
      toast.success('Đã xóa người ở')
    },
    onError: (err: unknown) => toast.error(getErrorMessageVi(err, 'Không thể xóa người ở')),
  })
}
