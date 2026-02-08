export type FeedbackStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface Feedback {
  id: number
  userId: number
  content: string
  status: FeedbackStatus
  adminNote: string | null
  createdAt: string
  updatedAt: string
}
