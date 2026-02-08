export type FeedbackStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESOLVED'

export interface FeedbackConversationMessage {
  role: 'admin' | 'user'
  userId: number
  content: string
  createdAt: string
}

export interface Feedback {
  id: number
  userId: number
  content: string
  status: FeedbackStatus
  adminNote: string | null
  conversation?: FeedbackConversationMessage[] | null
  createdAt: string
  updatedAt: string
}
