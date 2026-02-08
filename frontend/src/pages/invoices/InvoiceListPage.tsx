import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useProperties } from '@/hooks/useProperties'
import { useInvoices, useMarkInvoicePaid, useMarkInvoiceUnpaid, useDeleteInvoice } from '@/hooks/useInvoices'
import { formatAmount, formatDate, isDueDateReached } from '@/utils'

const PAGE_SIZE = 10

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 15 }, (_, i) => currentYear - 5 + i)

type InvoiceStatusFilter = 'PAID' | 'UNPAID' | ''

function parseStatus(s: string | null): InvoiceStatusFilter {
  if (s === 'PAID' || s === 'UNPAID') return s
  return ''
}

export function InvoiceListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const monthParam = searchParams.get('month')
  const yearParam = searchParams.get('year')
  const statusParam = searchParams.get('status')

  const [month, setMonth] = useState<number | ''>(() =>
    monthParam ? Number(monthParam) : ''
  )
  const [year, setYear] = useState<number | ''>(() =>
    yearParam ? Number(yearParam) : ''
  )
  const [propertyId, setPropertyId] = useState<number | ''>('')
  const [status, setStatus] = useState<InvoiceStatusFilter>(() =>
    parseStatus(statusParam) || 'UNPAID'
  )
  const [page, setPage] = useState(1)
  const [filtersExpanded, setFiltersExpanded] = useState(false)

  // Sync filter state from URL when searchParams change (e.g. from dashboard link)
  useEffect(() => {
    const s = parseStatus(searchParams.get('status'))
    const m = searchParams.get('month')
    const y = searchParams.get('year')
    const pid = searchParams.get('propertyId')
    setStatus(s || 'UNPAID')
    setMonth(m ? Number(m) : '')
    setYear(y ? Number(y) : '')
    setPropertyId(pid ? Number(pid) : '')
  }, [searchParams])

  // Default URL to status=UNPAID when opening /invoices without status (once on mount)
  useEffect(() => {
    if (searchParams.get('status') == null) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set('status', 'UNPAID')
        return next
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateUrl = (updates: { status?: InvoiceStatusFilter; month?: number | ''; year?: number | ''; propertyId?: number | '' }) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (updates.status !== undefined) {
        if (updates.status === '') next.delete('status')
        else next.set('status', updates.status)
      }
      if (updates.month !== undefined) {
        if (updates.month === '') next.delete('month')
        else next.set('month', String(updates.month))
      }
      if (updates.year !== undefined) {
        if (updates.year === '') next.delete('year')
        else next.set('year', String(updates.year))
      }
      if (updates.propertyId !== undefined) {
        if (updates.propertyId === '') next.delete('propertyId')
        else next.set('propertyId', String(updates.propertyId))
      }
      return next
    })
  }

  const { data: properties } = useProperties()
  const { data: invoices, isLoading, error } = useInvoices({
    month: month === '' ? undefined : month,
    year: year === '' ? undefined : year,
    propertyId: propertyId === '' ? undefined : propertyId,
    status: status === '' ? undefined : status,
  })
  const navigate = useNavigate()
  const markPaid = useMarkInvoicePaid()
  const markUnpaid = useMarkInvoiceUnpaid()
  const deleteInvoice = useDeleteInvoice()

  const handleMarkPaid = (id: number) => {
    if (!window.confirm('Đánh dấu hóa đơn này là đã thu tiền?')) return
    const paidAt = new Date().toISOString()
    markPaid.mutate({ id, input: { paidAt } })
  }

  const handleMarkUnpaid = (id: number) => {
    if (window.confirm('Đánh dấu hóa đơn này là chưa thanh toán?')) {
      markUnpaid.mutate(id)
    }
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Xóa hóa đơn chưa thanh toán này?')) {
      deleteInvoice.mutate(id)
    }
  }

  type StatusDisplay = { label: string; className: string }
  const getStatusDisplay = (inv: { status: string; dueDate?: string | null }): StatusDisplay => {
    if (inv.status === 'PAID') {
      return { label: 'Đã thanh toán', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' }
    }
    if (inv.status === 'UNPAID' && inv.dueDate && !isDueDateReached(inv.dueDate)) {
      return { label: 'Chưa tới ngày', className: 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300' }
    }
    return { label: 'Chưa thanh toán', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' }
  }

  const sortedInvoices = [...(invoices ?? [])].sort(
    (a, b) => b.year - a.year || b.month - a.month
  )
  const totalPages = Math.max(1, Math.ceil(sortedInvoices.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginatedInvoices = sortedInvoices.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  )
  useEffect(() => {
    if (page > totalPages && totalPages >= 1) setPage(totalPages)
  }, [totalPages, page])

  return (
    <div className="min-w-0">
      <div className="mb-4 flex flex-col gap-2 sm:mb-6">
        <Link
          to="/"
          className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          ← Tổng quan
        </Link>
        <h1 className="text-xl font-bold sm:text-2xl">Hóa đơn</h1>
      </div>
      <div className="mb-4 flex flex-wrap items-end gap-3 sm:gap-4">
        <div className="min-w-0 sm:w-36">
          <label className="mb-1 block text-xs font-medium text-slate-500">Trạng thái</label>
          <select
            value={status}
            onChange={(e) => {
              const v = e.target.value as InvoiceStatusFilter
              setStatus(v)
              updateUrl({ status: v })
              setPage(1)
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            <option value="">Tất cả</option>
            <option value="UNPAID">Chưa thanh toán</option>
            <option value="PAID">Đã thanh toán</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => setFiltersExpanded((e) => !e)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
        >
          {filtersExpanded ? 'Ẩn bộ lọc' : 'Thêm bộ lọc'}
        </button>
        {filtersExpanded && (
          <div className="flex w-full flex-wrap items-end gap-3 sm:flex-row sm:gap-4">
            <div className="min-w-0 sm:w-24">
              <label className="mb-1 block text-xs font-medium text-slate-500">Tháng</label>
              <select
                value={month}
                onChange={(e) => {
                  const v = e.target.value === '' ? '' : Number(e.target.value)
                  setMonth(v)
                  updateUrl({ month: v })
                  setPage(1)
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                <option value="">Tất cả</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0 sm:w-24">
              <label className="mb-1 block text-xs font-medium text-slate-500">Năm</label>
              <select
                value={year === '' ? '' : year}
                onChange={(e) => {
                  const v = e.target.value === '' ? '' : Number(e.target.value)
                  setYear(v)
                  updateUrl({ year: v })
                  setPage(1)
                }}
                className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                <option value="">Tất cả</option>
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="min-w-0 sm:min-w-[180px]">
              <label className="mb-1 block text-xs font-medium text-slate-500">Bất động sản</label>
              <select
                value={propertyId}
                onChange={(e) => {
                  const v = e.target.value === '' ? '' : Number(e.target.value)
                  setPropertyId(v)
                  updateUrl({ propertyId: v })
                  setPage(1)
                }}
                className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                <option value="">Tất cả</option>
                {properties?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
      {isLoading && <p className="text-slate-500">Đang tải…</p>}
      {error && <p className="text-red-600">Không tải được danh sách hóa đơn.</p>}
      {!isLoading && !error && (
        <>
          {/* Mobile: card list */}
          <div className="space-y-3 md:hidden">
            {!paginatedInvoices.length ? (
              <p className="rounded-lg border border-slate-200 bg-white py-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">
                Chưa có hóa đơn. Nhập chỉ số điện nước rồi tạo hóa đơn từ trang phòng.
              </p>
            ) : (
              paginatedInvoices.map((inv) => (
                <div
                  key={inv.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/invoices/${inv.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(`/invoices/${inv.id}`)
                    }
                  }}
                  className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-700/50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {inv.propertyName ?? '—'}
                      </p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {inv.roomName ?? `Phòng ${inv.roomId}`}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {inv.dueDate ? formatDate(inv.dueDate) : `Tháng ${inv.month}/${inv.year}`}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${getStatusDisplay(inv).className}`}
                    >
                      {getStatusDisplay(inv).label}
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                    {formatAmount(inv.totalAmount)}
                  </p>
                  <div
                    className="mt-3 flex flex-wrap gap-2 border-t border-slate-200 pt-3 dark:border-slate-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {inv.status === 'UNPAID' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleMarkPaid(inv.id)}
                          className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        >
                          Đánh dấu đã thu
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(inv.id)}
                          disabled={deleteInvoice.isPending}
                          className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Xóa
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleMarkUnpaid(inv.id)}
                        className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      >
                        Đánh dấu chưa thu
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop: table */}
          <div className="hidden min-w-0 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 md:block">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                    Bất động sản
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                    Phòng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                    Ngày
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                    Tiền thuê
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                    Điện
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                    Nước
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                    Tổng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-800/50">
                {!paginatedInvoices.length ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                      Chưa có hóa đơn. Nhập chỉ số điện nước rồi tạo hóa đơn từ trang phòng.
                    </td>
                  </tr>
                ) : (
                  paginatedInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      onClick={() => navigate(`/invoices/${inv.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          navigate(`/invoices/${inv.id}`)
                        }
                      }}
                    >
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {inv.propertyName ?? '—'}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {inv.roomName ?? `Phòng ${inv.roomId}`}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {inv.dueDate ? formatDate(inv.dueDate) : `${inv.month}/${inv.year}`}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                        {formatAmount(inv.rentAmount)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                        {formatAmount(inv.elecAmount)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                        {formatAmount(inv.waterAmount)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">
                        {formatAmount(inv.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatusDisplay(inv).className}`}
                        >
                          {getStatusDisplay(inv).label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        {inv.status === 'UNPAID' ? (
                          <span className="flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleMarkPaid(inv.id)}
                              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            >
                              Đánh dấu đã thu
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(inv.id)}
                              disabled={deleteInvoice.isPending}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Xóa
                            </button>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMarkUnpaid(inv.id)}
                            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                          >
                            Đánh dấu chưa thu
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-slate-600"
              >
                Trước
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Trang {safePage} / {totalPages} ({sortedInvoices.length} hóa đơn)
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-slate-600"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
      <p className="mt-4 text-sm text-slate-500">
        Để tạo hóa đơn: vào Bất động sản → Phòng → nhập chỉ số điện nước theo tháng, sau đó dùng &quot;Tạo hóa đơn&quot; trên trang phòng.
      </p>
    </div>
  )
}
