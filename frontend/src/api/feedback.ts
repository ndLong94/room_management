import { api } from '@/lib/api'
import type { Feedback, FeedbackConversationMessage } from '@/types/feedback'

export interface AdminFeedbackListItem {
  id: number
  userId: number
  username: string | null
  content: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESOLVED'
  adminNote: string | null
  conversation?: FeedbackConversationMessage[] | null
  createdAt: string
  updatedAt: string
}

export interface FetchAdminFeedbackParams {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESOLVED'
  userId?: number
}

export async function fetchAdminFeedbackList(params?: FetchAdminFeedbackParams): Promise<AdminFeedbackListItem[]> {
  const { data } = await api.get<AdminFeedbackListItem[]>('/api/admin/feedback', {
    params: {
      ...(params?.status && { status: params.status }),
      ...(params?.userId != null && { userId: params.userId }),
    },
  })
  return data
}

export async function createFeedback(body: { content: string }): Promise<Feedback> {
  const { data } = await api.post<Feedback>('/api/feedback', body)
  return data
}

export async function fetchMyFeedback(): Promise<Feedback[]> {
  const { data } = await api.get<Feedback[]>('/api/feedback')
  return data
}

export async function updateMyFeedback(feedbackId: number, body: { content: string }): Promise<Feedback> {
  const { data } = await api.put<Feedback>(`/api/feedback/${feedbackId}`, body)
  return data
}

export async function deleteMyFeedback(feedbackId: number): Promise<void> {
  await api.delete(`/api/feedback/${feedbackId}`)
}

export async function replyMyFeedback(feedbackId: number, body: { content: string }): Promise<Feedback> {
  const { data } = await api.post<Feedback>(`/api/feedback/${feedbackId}/reply`, body)
  return data
}

export async function replyAdminFeedback(feedbackId: number, body: { content: string }): Promise<Feedback> {
  const { data } = await api.post<Feedback>(`/api/admin/feedback/${feedbackId}/reply`, body)
  return data
}

export async function updateFeedbackAdmin(
  feedbackId: number,
  body: { content?: string; status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESOLVED'; adminNote?: string }
): Promise<Feedback> {
  const { data } = await api.put<Feedback>(`/api/admin/feedback/${feedbackId}`, body)
  return data
}
