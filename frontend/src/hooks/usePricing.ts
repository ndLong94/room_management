import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getErrorMessageVi } from '@/utils'
import { fetchPricing, updatePricing } from '@/api/pricing'
import type { UpdatePricingInput } from '@/types/pricing'

const QUERY_KEY = ['settings', 'pricing'] as const

export function usePricing() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchPricing,
  })
}

export function useUpdatePricing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdatePricingInput) => updatePricing(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Đã cập nhật đơn giá')
    },
    onError: (err: unknown) => toast.error(getErrorMessageVi(err, 'Không thể cập nhật đơn giá')),
  })
}
