import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  createRoom,
  deleteRoom,
  fetchRooms,
  fetchRoom,
  updateRoom,
} from '@/api/rooms'
import type { CreateRoomInput, UpdateRoomInput } from '@/types/room'

const roomsKey = (propertyId: number) => ['properties', propertyId, 'rooms'] as const

export function useRooms(propertyId: number | null) {
  return useQuery({
    queryKey: roomsKey(propertyId!),
    queryFn: () => fetchRooms(propertyId!),
    enabled: propertyId != null,
    staleTime: 60 * 1000,
  })
}

export function useRoom(propertyId: number | null, roomId: number | null) {
  return useQuery({
    queryKey: [...roomsKey(propertyId!), roomId],
    queryFn: () => fetchRoom(propertyId!, roomId!),
    enabled: propertyId != null && roomId != null,
    staleTime: 60 * 1000,
  })
}

export function useCreateRoom(propertyId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateRoomInput) => createRoom(propertyId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomsKey(propertyId) })
      toast.success('Đã thêm phòng')
    },
    onError: () => toast.error('Không thể thêm phòng'),
  })
}

export function useUpdateRoom(propertyId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ roomId, input }: { roomId: number; input: UpdateRoomInput }) =>
      updateRoom(propertyId, roomId, input),
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: roomsKey(propertyId) })
      queryClient.invalidateQueries({ queryKey: [...roomsKey(propertyId), roomId] })
      toast.success('Đã cập nhật phòng')
    },
    onError: () => toast.error('Không thể cập nhật phòng'),
  })
}

export function useDeleteRoom(propertyId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roomId: number) => deleteRoom(propertyId, roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomsKey(propertyId) })
      toast.success('Đã xóa phòng')
    },
    onError: () => toast.error('Không thể xóa phòng'),
  })
}
