import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useInvoice, useMarkInvoicePaid, useMarkInvoiceUnpaid, useDeleteInvoice, useSendInvoiceZalo } from '@/hooks/useInvoices'
import { formatAmount, formatDate, isDueDateReached } from '@/utils'

const ENABLE_ZALO = import.meta.env.VITE_ENABLE_ZALO === 'true'

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const invoiceId = id ? parseInt(id, 10) : null
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: invoice, isLoading, error } = useInvoice(invoiceId)
  const markPaid = useMarkInvoicePaid()
  const markUnpaid = useMarkInvoiceUnpaid()
  const deleteInvoice = useDeleteInvoice()
  const sendZalo = useSendInvoiceZalo()

  if (invoiceId == null) return <p className="text-red-600">Mã hóa đơn không hợp lệ.</p>
  if (isLoading) return <p className="text-slate-500">Đang tải…</p>
  if (error || !invoice) return <p className="text-red-600">Không tìm thấy hóa đơn.</p>

  const statusLabel = invoice.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'
  const showNotYetDue = invoice.status === 'UNPAID' && invoice.dueDate && !isDueDateReached(invoice.dueDate)

  return (
    <div className="min-w-0">
      <Link
        to="/invoices"
        className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        ← Hóa đơn
      </Link>
      <h1 className="mt-2 mb-4 break-words text-xl font-bold sm:mb-6 sm:text-2xl">
        Chi tiết hóa đơn #{invoice.id}
      </h1>

      <div className="max-w-lg space-y-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="grid gap-2 text-sm">
          <p>
            <span className="text-slate-500 dark:text-slate-400">Bất động sản:</span>{' '}
            {invoice.propertyName ?? '—'}
          </p>
          <p>
            <span className="text-slate-500 dark:text-slate-400">Phòng:</span>{' '}
            {invoice.roomName ?? `Phòng ${invoice.roomId}`}
          </p>
          <p>
            <span className="text-slate-500 dark:text-slate-400">Kỳ:</span> Tháng {invoice.month}/{invoice.year}
          </p>
          <p>
            <span className="text-slate-500 dark:text-slate-400">Hạn thanh toán:</span>{' '}
            {invoice.dueDate ? formatDate(invoice.dueDate) : '—'}
            {showNotYetDue && (
              <span className="ml-1 text-amber-600 dark:text-amber-400">(chưa tới ngày)</span>
            )}
          </p>
          <p>
            <span className="text-slate-500 dark:text-slate-400">Tiền thuê:</span>{' '}
            {formatAmount(invoice.rentAmount)}
          </p>
          <p>
            <span className="text-slate-500 dark:text-slate-400">Điện:</span> {formatAmount(invoice.elecAmount)}
          </p>
          <p>
            <span className="text-slate-500 dark:text-slate-400">Nước:</span> {formatAmount(invoice.waterAmount)}
          </p>
          <p>
            <span className="text-slate-500 dark:text-slate-400">Khác:</span> {formatAmount(invoice.otherAmount)}
          </p>
          <p className="font-semibold text-slate-900 dark:text-white">
            Tổng: {formatAmount(invoice.totalAmount)}
          </p>
          <p>
            <span className="text-slate-500 dark:text-slate-400">Trạng thái:</span>{' '}
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                invoice.status === 'PAID'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
              }`}
            >
              {statusLabel}
            </span>
          </p>
          {invoice.status === 'PAID' && invoice.paidAt && (
            <p>
              <span className="text-slate-500 dark:text-slate-400">Đã thanh toán lúc:</span>{' '}
              {formatDate(invoice.paidAt.slice(0, 10))}
              {invoice.paymentMethod && ` (${invoice.paymentMethod})`}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
          {ENABLE_ZALO && (
            <button
              type="button"
              onClick={() => {
                if (!window.confirm('Gửi tin nhắn Zalo cho hóa đơn này đến người nhận đã chọn trong phòng?')) return
                sendZalo.mutate(invoice.id)
              }}
              disabled={sendZalo.isPending}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {sendZalo.isPending ? 'Đang gửi…' : 'Gửi Zalo'}
            </button>
          )}
          {invoice.status === 'UNPAID' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  if (!window.confirm('Đánh dấu hóa đơn này là đã thu tiền?')) return
                  const paidAt = new Date().toISOString()
                  markPaid.mutate(
                    { id: invoice.id, input: { paidAt } },
                    {
                      onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['invoices'] })
                      },
                    }
                  )
                }}
                disabled={markPaid.isPending}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                {markPaid.isPending ? 'Đang cập nhật…' : 'Đánh dấu đã thu'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Xóa hóa đơn chưa thanh toán này?')) {
                    deleteInvoice.mutate(invoice.id, {
                      onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['invoices'] })
                        navigate('/invoices', { replace: true })
                      },
                    })
                  }
                }}
                disabled={deleteInvoice.isPending}
                className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                {deleteInvoice.isPending ? 'Đang xóa…' : 'Xóa hóa đơn'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Đánh dấu hóa đơn này là chưa thanh toán?')) {
                  markUnpaid.mutate(invoice.id, {
                    onSuccess: () => {
                      queryClient.invalidateQueries({ queryKey: ['invoices'] })
                    },
                  })
                }
              }}
              disabled={markUnpaid.isPending}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {markUnpaid.isPending ? 'Đang cập nhật…' : 'Đánh dấu chưa thu'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
