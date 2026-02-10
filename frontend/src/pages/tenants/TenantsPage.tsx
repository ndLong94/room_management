import { Link } from 'react-router-dom'

/**
 * Người thuê & Hợp đồng thuê — tính năng dành cho gói Premium.
 * Khi có premium: thay nội dung bằng TenantsPageFull hoặc check user.plan === 'premium'.
 */
export function TenantsPage() {
  return (
    <div className="min-w-0">
      <h1 className="mb-6 text-xl font-bold sm:text-2xl">Người thuê & Hợp đồng thuê</h1>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-900/20">
        <p className="mb-2 font-medium text-amber-800 dark:text-amber-200">
          Tính năng dành cho gói Premium
        </p>
        <p className="mb-4 text-sm text-amber-700 dark:text-amber-300">
          Quản lý người thuê (chủ hợp đồng) và hợp đồng thuê phòng là tính năng nâng cao. Nâng cấp lên gói Premium để sử dụng.
        </p>
        <Link
          to="/"
          className="inline-block rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
        >
          Quay lại tổng quan
        </Link>
      </div>
    </div>
  )
}
