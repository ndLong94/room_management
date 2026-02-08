import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { createFeedback, fetchMyFeedback, updateFeedbackAdmin } from '@/api/feedback'

export function useMyFeedback() {
  return useQuery({
    queryKey: ['feedback', 'me'],
    queryFn: fetchMyFeedback,
  })
}

export function useCreateFeedback() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { content: string }) => createFeedback(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] })
      toast.success('Đã gửi ý kiến')
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Không thể gửi ý kiến')
    },
  })
}

export function useUpdateFeedbackAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      feedbackId,
      ...body
    }: {
      feedbackId: number
      content?: string
      status?: 'PENDING' | 'APPROVED' | 'REJECTED'
      adminNote?: string
    }) => updateFeedbackAdmin(feedbackId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['feedback'] })
      toast.success('Đã cập nhật ý kiến')
    },
    onError: () => toast.error('Không thể cập nhật'),
  })
}
