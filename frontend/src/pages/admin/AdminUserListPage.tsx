import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import {
  useAdminUsers,
  useCreateUser,
  useApproveUser,
  useSetUserStatus,
} from '@/hooks/useAdminUsers'
import { formatAmount } from '@/utils'
import type { UserStatus } from '@/types/user'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${day}/${m}/${y}`
}

function StatusBadge({ status }: { status: UserStatus }) {
  const map: Record<UserStatus, { label: string; className: string }> = {
    DRAFT: { label: 'Chờ duyệt', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
    ACTIVE: { label: 'Hoạt động', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    INACTIVE: { label: 'Vô hiệu', className: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' },
  }
  const { label, className } = map[status]
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

const PAGE_SIZE = 10

export function AdminUserListPage() {
  const { user } = useCurrentUser()
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<'DRAFT' | 'ACTIVE' | 'INACTIVE' | ''>('')
  const { data: paged, isLoading, error } = useAdminUsers({
    page,
    size: PAGE_SIZE,
    status: statusFilter || undefined,
  })
  const users = paged?.content ?? []
  const totalPages = paged?.totalPages ?? 0
  const createUser = useCreateUser()
  const approveUser = useApproveUser()
  const setUserStatus = useSetUserStatus()

  const [showCreate, setShowCreate] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    setPage(0)
  }, [statusFilter])

  if (user?.role !== 'ADMIN') {
    navigate('/', { replace: true })
    return null
  }

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUsername.trim() || !newEmail.trim() || newPassword.length < 6) {
      toast.error('Nhập đủ username, email và mật khẩu (ít nhất 6 ký tự)')
      return
    }
    createUser.mutate(
      { username: newUsername.trim(), email: newEmail.trim().toLowerCase(), password: newPassword },
      {
        onSuccess: () => {
          setShowCreate(false)
          setNewUsername('')
          setNewEmail('')
          setNewPassword('')
        },
      }
    )
  }

  return (
    <div className="min-w-0">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Quản lý user</h1>
          <p className="mt-1 text-sm text-slate-500">User đăng ký (chờ duyệt), số phòng, giá thanh toán.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'DRAFT' | 'ACTIVE' | 'INACTIVE' | '')}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="DRAFT">Chờ duyệt</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Vô hiệu</option>
          </select>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="shrink-0 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500"
          >
            Tạo user
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-3 font-semibold">Tạo user (mật khẩu khởi đầu)</h2>
          <form onSubmit={handleCreateUser} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="min-w-0 flex-1 sm:max-w-[140px]">
              <label className="mb-1 block text-xs font-medium text-slate-500">Username</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div className="min-w-0 flex-1 sm:max-w-[200px]">
              <label className="mb-1 block text-xs font-medium text-slate-500">Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div className="min-w-0 flex-1 sm:max-w-[160px]">
              <label className="mb-1 block text-xs font-medium text-slate-500">Mật khẩu (≥6 ký tự)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createUser.isPending}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-600"
              >
                {createUser.isPending ? 'Đang tạo…' : 'Tạo'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:text-slate-300"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading && <p className="text-slate-500">Đang tải…</p>}
      {error && <p className="text-red-600">Không tải được danh sách.</p>}
      {!isLoading && !error && (
        <>
          {/* Mobile: cards */}
          <div className="space-y-3 md:hidden">
            {users.length === 0 ? (
              <p className="rounded-lg border border-slate-200 bg-white py-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">
                Chưa có user.
              </p>
            ) : (
              users.map((u) => (
                <div
                  key={u.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50"
                >
                  <Link
                    to={`/admin/users/${u.id}`}
                    className="flex flex-wrap items-start justify-between gap-2 block hover:opacity-90"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{u.username}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <StatusBadge status={u.status} />
                        {u.role === 'ADMIN' && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-sm dark:border-slate-700">
                    <span className="text-slate-500">Đăng ký:</span>
                    <span>{formatDate(u.createdAt)}</span>
                    <span className="text-slate-500">Số phòng:</span>
                    <span>{u.roomCount}</span>
                    <span className="text-slate-500">Giá đặt:</span>
                    <span>{formatAmount(u.platformPriceAmount)}</span>
                    <span className="text-slate-500">Thanh toán gần nhất:</span>
                    <span>{formatDate(u.lastPaymentAt)}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
                    {u.status === 'DRAFT' && u.role !== 'ADMIN' && (
                      <button
                        type="button"
                        onClick={() => approveUser.mutate(u.id)}
                        disabled={approveUser.isPending}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Duyệt
                      </button>
                    )}
                    {u.role !== 'ADMIN' && u.status === 'ACTIVE' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Vô hiệu hóa user này?')) setUserStatus.mutate({ userId: u.id, status: 'INACTIVE' })
                        }}
                        disabled={setUserStatus.isPending}
                        className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400"
                      >
                        Vô hiệu
                      </button>
                    )}
                    {u.role !== 'ADMIN' && u.status === 'INACTIVE' && (
                      <button
                        type="button"
                        onClick={() => setUserStatus.mutate({ userId: u.id, status: 'ACTIVE' })}
                        disabled={setUserStatus.isPending}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Kích hoạt
                      </button>
                    )}
                    <Link
                      to={`/admin/users/${u.id}`}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:text-slate-300"
                    >
                      Chi tiết
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop: table */}
          <div className="hidden overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 md:block">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Đăng ký</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Số phòng</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Giá (đặt)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Thanh toán gần nhất</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-800/50">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      Chưa có user.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/users/${u.id}`}
                          className="block font-medium text-slate-900 hover:text-slate-700 dark:text-white dark:hover:text-slate-200"
                        >
                          <p>{u.username}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                          {u.role === 'ADMIN' && (
                            <span className="mt-1 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                              Admin
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">{u.roomCount}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">
                        {formatAmount(u.platformPriceAmount)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {formatDate(u.lastPaymentAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {u.status === 'DRAFT' && u.role !== 'ADMIN' && (
                          <button
                            type="button"
                            onClick={() => approveUser.mutate(u.id)}
                            disabled={approveUser.isPending}
                            className="mr-2 rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            Duyệt
                          </button>
                        )}
                        {u.role !== 'ADMIN' && u.status === 'ACTIVE' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Vô hiệu hóa user này?')) setUserStatus.mutate({ userId: u.id, status: 'INACTIVE' })
                            }}
                            disabled={setUserStatus.isPending}
                            className="mr-2 rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400"
                          >
                            Vô hiệu
                          </button>
                        )}
                        {u.role !== 'ADMIN' && u.status === 'INACTIVE' && (
                          <button
                            type="button"
                            onClick={() => setUserStatus.mutate({ userId: u.id, status: 'ACTIVE' })}
                            disabled={setUserStatus.isPending}
                            className="mr-2 rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            Kích hoạt
                          </button>
                        )}
                        <Link
                          to={`/admin/users/${u.id}`}
                          className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        >
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-slate-500">
                Trang {page + 1} / {totalPages} (tổng {paged?.totalElements ?? 0} user)
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-slate-600"
                >
                  Trước
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-slate-600"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
