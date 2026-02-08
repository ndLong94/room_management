import { api } from '@/lib/api'
import type { Feedback } from '@/types/feedback'

export async function createFeedback(body: { content: string }): Promise<Feedback> {
  const { data } = await api.post<Feedback>('/api/feedback', body)
  return data
}

export async function fetchMyFeedback(): Promise<Feedback[]> {
  const { data } = await api.get<Feedback[]>('/api/feedback')
  return data
}

export async function updateFeedbackAdmin(
  feedbackId: number,
  body: { content?: string; status?: 'PENDING' | 'APPROVED' | 'REJECTED'; adminNote?: string }
): Promise<Feedback> {
  const { data } = await api.put<Feedback>(`/api/admin/feedback/${feedbackId}`, body)
  return data
}
