import type { FeedbackConversationMessage } from './feedback'

export type UserRole = 'USER' | 'ADMIN'

export type UserStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE'

export interface User {
  id: number
  username: string
  email: string
  role: UserRole
  status?: UserStatus
  createdAt: string
}

export interface AdminUserListItem {
  id: number
  username: string
  email: string
  role: UserRole
  status: UserStatus
  createdAt: string
  roomCount: number
  platformPriceAmount: string
  lastPaymentAt: string | null
}

export interface UserPlatformPaymentResponse {
  id: number
  userId: number
  amount: string
  paidAt: string
  note: string | null
  createdAt: string
}

export interface AdminUserDetail {
  user: User
  roomCount: number
  platformPriceAmount: string
  platformPriceNote: string | null
  platformPriceUpdatedAt: string | null
  payments: UserPlatformPaymentResponse[]
  feedbacks?: FeedbackItem[]
}

export interface FeedbackItem {
  id: number
  userId: number
  content: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESOLVED'
  adminNote: string | null
  conversation?: FeedbackConversationMessage[] | null
  createdAt: string
  updatedAt: string
}

export interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}
