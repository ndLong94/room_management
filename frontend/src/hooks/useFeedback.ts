import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  createFeedback,
  fetchMyFeedback,
  fetchAdminFeedbackList,
  updateMyFeedback,
  deleteMyFeedback,
  replyMyFeedback,
  replyAdminFeedback,
  updateFeedbackAdmin,
  type FetchAdminFeedbackParams,
} from '@/api/feedback'

export function useAdminFeedbackList(params?: FetchAdminFeedbackParams) {
  return useQuery({
    queryKey: ['admin', 'feedback', params?.status ?? null, params?.userId ?? null],
    queryFn: () => fetchAdminFeedbackList(params),
  })
}

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

export function useUpdateMyFeedback() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ feedbackId, content }: { feedbackId: number; content: string }) =>
      updateMyFeedback(feedbackId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] })
      toast.success('Đã cập nhật ý kiến')
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Không thể cập nhật')
    },
  })
}

export function useDeleteMyFeedback() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (feedbackId: number) => deleteMyFeedback(feedbackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] })
      toast.success('Đã xóa ý kiến')
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Không thể xóa')
    },
  })
}

export function useReplyMyFeedback() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ feedbackId, content }: { feedbackId: number; content: string }) =>
      replyMyFeedback(feedbackId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] })
      toast.success('Đã gửi phản hồi')
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Không thể gửi phản hồi')
    },
  })
}

export function useReplyAdminFeedback() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ feedbackId, content }: { feedbackId: number; content: string }) =>
      replyAdminFeedback(feedbackId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['feedback'] })
      toast.success('Đã gửi phản hồi')
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Không thể gửi phản hồi')
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
      status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESOLVED'
      adminNote?: string
    }) => updateFeedbackAdmin(feedbackId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['feedback'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'feedback'] })
      toast.success('Đã cập nhật ý kiến')
    },
    onError: () => toast.error('Không thể cập nhật'),
  })
}
