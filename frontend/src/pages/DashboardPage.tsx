import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDashboardSummary } from '@/hooks/useDashboard'
import { formatMoney } from '@/utils'

const now = new Date()
const currentMonth = now.getMonth() + 1
const currentYear = now.getFullYear()

export function DashboardPage() {
  const [month, setMonth] = useState(currentMonth)
  const [year, setYear] = useState(currentYear)

  const { data: summary, isLoading, error } = useDashboardSummary(month, year)

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Tổng quan</h1>
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(2000, m - 1, 1).toLocaleString('vi', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="min-w-[5rem] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          >
            {Array.from({ length: 15 }, (_, i) => currentYear - 5 + i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && <p className="text-slate-500">Đang tải…</p>}
      {error && <p className="text-red-600">Không tải được tổng quan.</p>}

      {!isLoading && !error && summary && (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tổng số phòng</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{summary.totalRooms}</p>
            </div>
            <Link
              to="/rooms?status=OCCUPIED"
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
            >
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Đã cho thuê</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{summary.occupiedRooms}</p>
            </Link>
            <Link
              to="/rooms?status=VACANT"
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
            >
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Còn trống</p>
              <p className="mt-1 text-2xl font-bold text-slate-600 dark:text-slate-300">{summary.vacantRooms}</p>
            </Link>
            <Link
              to="/invoices?status=UNPAID"
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
            >
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Cần thu ({month}/{year})</p>
              <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                {formatMoney(summary.totalReceivable)}
              </p>
            </Link>
            <Link
              to="/invoices?status=PAID"
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
            >
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Đã thu ({month}/{year})</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {formatMoney(summary.totalCollected)}
              </p>
            </Link>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Liên kết nhanh
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/properties"
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Bất động sản
              </Link>
              <Link
                to="/invoices"
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Hóa đơn
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
