import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  fetchInvoice,
  fetchInvoices,
  generateInvoice,
  markInvoicePaid,
  markInvoiceUnpaid,
  deleteInvoice,
} from '@/api/invoices'
import type { MarkPaidInput } from '@/types/invoice'

const invoicesKey = (params: {
  month?: number
  year?: number
  propertyId?: number
  status?: 'PAID' | 'UNPAID'
}) => ['invoices', params] as const

export function useInvoices(params: {
  month?: number
  year?: number
  propertyId?: number
  status?: 'PAID' | 'UNPAID'
}) {
  return useQuery({
    queryKey: invoicesKey(params),
    queryFn: () => fetchInvoices(params),
    staleTime: 60 * 1000,
  })
}

export function useInvoice(id: number | null) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => fetchInvoice(id!),
    enabled: id != null,
    staleTime: 60 * 1000,
  })
}

export function useGenerateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      propertyId,
      roomId,
      month,
      year,
    }: {
      propertyId: number
      roomId: number
      month: number
      year: number
    }) => generateInvoice(propertyId, roomId, month, year),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Đã tạo hóa đơn')
    },
    onError: (err: { response?: { status?: number; data?: { message?: string } } }) => {
      if (err?.response?.status === 409) return
      const msg = err?.response?.data?.message ?? 'Không thể tạo hóa đơn'
      toast.error(msg)
    },
  })
}

export function useMarkInvoicePaid() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: MarkPaidInput }) => markInvoicePaid(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Đã đánh dấu đã thanh toán')
    },
    onError: () => toast.error('Không thể cập nhật hóa đơn'),
  })
}

export function useMarkInvoiceUnpaid() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => markInvoiceUnpaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Đã đánh dấu chưa thanh toán')
    },
    onError: () => toast.error('Không thể cập nhật hóa đơn'),
  })
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Đã xóa hóa đơn')
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Không thể xóa hóa đơn')
    },
  })
}
