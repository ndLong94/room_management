import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  createProperty,
  deleteProperty,
  fetchProperties,
  fetchProperty,
  updateProperty,
} from '@/api/properties'
import type { CreatePropertyInput, UpdatePropertyInput } from '@/types/property'

const QUERY_KEY = ['properties'] as const

export function useProperties() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchProperties,
    staleTime: 2 * 60 * 1000,
  })
}

export function useProperty(id: number | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => fetchProperty(id!),
    enabled: id != null,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePropertyInput) => createProperty(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Đã thêm bất động sản')
    },
    onError: () => {
      toast.error('Không thể thêm bất động sản')
    },
  })
}

export function useUpdateProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdatePropertyInput }) =>
      updateProperty(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, id] })
      toast.success('Đã cập nhật bất động sản')
    },
    onError: () => {
      toast.error('Không thể cập nhật bất động sản')
    },
  })
}

export function useDeleteProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Đã xóa bất động sản')
    },
    onError: () => {
      toast.error('Không thể xóa bất động sản')
    },
  })
}
