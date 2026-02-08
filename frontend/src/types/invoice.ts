export type InvoiceStatus = 'UNPAID' | 'PAID'

export interface Invoice {
  id: number
  propertyId?: number
  propertyName?: string
  roomId: number
  roomName?: string
  month: number
  year: number
  dueDate?: string | null
  rentAmount: string
  elecAmount: string
  waterAmount: string
  otherAmount: string
  totalAmount: string
  status: InvoiceStatus
  paidAt: string | null
  paymentMethod: string | null
  createdAt: string
}

export interface MarkPaidInput {
  paidAt: string // ISO date
  paymentMethod?: string
}
