import { api } from '@/lib/api'
import type { Invoice, MarkPaidInput } from '@/types/invoice'

export async function fetchInvoices(params: {
  month?: number
  year?: number
  propertyId?: number
  status?: 'PAID' | 'UNPAID'
}): Promise<Invoice[]> {
  const { data } = await api.get<Invoice[]>('/api/invoices', { params })
  return data
}

export async function fetchInvoice(id: number): Promise<Invoice> {
  const { data } = await api.get<Invoice>(`/api/invoices/${id}`)
  return data
}

export async function generateInvoice(
  propertyId: number,
  roomId: number,
  month: number,
  year: number
): Promise<Invoice> {
  const { data } = await api.post<Invoice>(
    `/api/properties/${propertyId}/rooms/${roomId}/invoices/generate`,
    null,
    { params: { month, year } }
  )
  return data
}

export async function markInvoicePaid(id: number, input: MarkPaidInput): Promise<Invoice> {
  const { data } = await api.post<Invoice>(`/api/invoices/${id}/mark-paid`, input)
  return data
}

export async function markInvoiceUnpaid(id: number): Promise<Invoice> {
  const { data } = await api.post<Invoice>(`/api/invoices/${id}/mark-unpaid`)
  return data
}

export async function deleteInvoice(id: number): Promise<void> {
  await api.delete(`/api/invoices/${id}`)
}
