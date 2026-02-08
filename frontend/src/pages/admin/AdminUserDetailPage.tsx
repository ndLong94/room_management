import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import {
  useAdminUserDetail,
  useSetPlatformPrice,
  useRecordPlatformPayment,
  useApproveUser,
  useSetUserStatus,
} from '@/hooks/useAdminUsers'
import { useUpdateFeedbackAdmin } from '@/hooks/useFeedback'
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

function FeedbackStatusBadge({ status }: { status: 'PENDING' | 'APPROVED' | 'REJECTED' }) {
  const map = {
    PENDING: { label: 'Chờ xử lý', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
    APPROVED: { label: 'Đồng ý', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    REJECTED: { label: 'Từ chối', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  }
  const { label, className } = map[status]
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{label}</span>
}

export function AdminUserDetailPage() {
  const { user: currentUser } = useCurrentUser()
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()
  const id = userId ? parseInt(userId, 10) : null
  const { data: detail, isLoading, error } = useAdminUserDetail(id)
  const setPrice = useSetPlatformPrice(id ?? 0)
  const recordPayment = useRecordPlatformPayment(id ?? 0)
  const approveUser = useApproveUser()
  const setUserStatus = useSetUserStatus()
  const updateFeedback = useUpdateFeedbackAdmin()

  const [priceAmount, setPriceAmount] = useState('')
  const [priceNote, setPriceNote] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentNote, setPaymentNote] = useState('')

  if (currentUser?.role !== 'ADMIN') {
    navigate('/', { replace: true })
    return null
  }

  if (id == null) return <p className="text-red-600">ID không hợp lệ.</p>
  if (isLoading) return <p className="text-slate-500">Đang tải…</p>
  if (error || !detail) return <p className="text-red-600">Không tìm thấy user.</p>

  const handleSetPrice = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(priceAmount)
    if (Number.isNaN(amount) || amount < 0) {
      toast.error('Nhập số tiền hợp lệ')
      return
    }
    setPrice.mutate(
      { amount, note: priceNote.trim() || undefined },
      {
        onSuccess: () => {
          setPriceAmount('')
          setPriceNote('')
        },
      }
    )
  }

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(paymentAmount)
    if (Number.isNaN(amount) || amount < 0) {
      toast.error('Nhập số tiền hợp lệ')
      return
    }
    recordPayment.mutate(
      { amount, note: paymentNote.trim() || undefined },
      {
        onSuccess: () => {
          setPaymentAmount('')
          setPaymentNote('')
        },
      }
    )
  }

  return (
    <div className="min-w-0">
      <Link
        to="/admin/users"
        className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        ← Quản lý user
      </Link>
      <h1 className="mt-2 mb-4 text-xl font-bold sm:text-2xl">
        User: {detail.user.username}
      </h1>

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <h2 className="mb-3 font-semibold">Thông tin</h2>
        <p><span className="text-slate-500">Email:</span> {detail.user.email}</p>
        <p><span className="text-slate-500">Trạng thái:</span> <StatusBadge status={detail.user.status ?? 'DRAFT'} /></p>
        <p><span className="text-slate-500">Đăng ký:</span> {formatDate(detail.user.createdAt)}</p>
        <p><span className="text-slate-500">Số phòng:</span> {detail.roomCount}</p>
        <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
          {detail.user.status === 'DRAFT' && detail.user.role !== 'ADMIN' && (
            <button
              type="button"
              onClick={() => approveUser.mutate(id)}
              disabled={approveUser.isPending}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {approveUser.isPending ? 'Đang duyệt…' : 'Duyệt'}
            </button>
          )}
          {detail.user.role !== 'ADMIN' && detail.user.status !== 'DRAFT' && (
            <>
              {detail.user.status === 'ACTIVE' && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Vô hiệu hóa user này? User sẽ không đăng nhập được.')) {
                      setUserStatus.mutate({ userId: id, status: 'INACTIVE' })
                    }
                  }}
                  disabled={setUserStatus.isPending}
                  className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Vô hiệu
                </button>
              )}
              {detail.user.status === 'INACTIVE' && (
                <button
                  type="button"
                  onClick={() => setUserStatus.mutate({ userId: id, status: 'ACTIVE' })}
                  disabled={setUserStatus.isPending}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Kích hoạt lại
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <h2 className="mb-3 font-semibold">Giá thanh toán (admin đặt cho user)</h2>
        <p className="mb-3">
          Giá hiện tại: <strong>{formatAmount(detail.platformPriceAmount)}</strong>
          {detail.platformPriceNote && (
            <span className="ml-2 text-slate-500">— {detail.platformPriceNote}</span>
          )}
        </p>
        <form onSubmit={handleSetPrice} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Số tiền (VND)</label>
            <input
              type="number"
              min="0"
              step="1000"
              value={priceAmount}
              onChange={(e) => setPriceAmount(e.target.value)}
              placeholder="0"
              className="w-40 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Ghi chú</label>
            <input
              type="text"
              value={priceNote}
              onChange={(e) => setPriceNote(e.target.value)}
              placeholder="Tùy chọn"
              className="w-48 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={setPrice.isPending}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-600"
          >
            {setPrice.isPending ? 'Đang lưu…' : 'Đặt giá'}
          </button>
        </form>
      </div>

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <h2 className="mb-3 font-semibold">Ghi nhận thanh toán</h2>
        <form onSubmit={handleRecordPayment} className="mb-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Số tiền (VND)</label>
            <input
              type="number"
              min="0"
              step="1000"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="0"
              className="w-40 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Ghi chú</label>
            <input
              type="text"
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              placeholder="Tùy chọn"
              className="w-48 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={recordPayment.isPending}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {recordPayment.isPending ? 'Đang ghi…' : 'Ghi nhận thanh toán'}
          </button>
        </form>

        <h3 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">Lịch sử thanh toán</h3>
        {detail.payments.length === 0 ? (
          <p className="text-sm text-slate-500">Chưa có thanh toán.</p>
        ) : (
          <ul className="space-y-2">
            {detail.payments.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-100 py-2 px-3 dark:border-slate-700"
              >
                <span className="font-medium">{formatAmount(p.amount)}</span>
                <span className="text-slate-500 text-sm">{formatDate(p.paidAt)}</span>
                {p.note && <span className="w-full text-sm text-slate-500">{p.note}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Ý kiến user */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <h2 className="mb-3 font-semibold">Ý kiến user</h2>
        {(!detail.feedbacks || detail.feedbacks.length === 0) ? (
          <p className="text-sm text-slate-500">Chưa có ý kiến nào.</p>
        ) : (
          <ul className="space-y-4">
            {(detail.feedbacks || []).map((f) => (
              <li key={f.id} className="rounded border border-slate-100 p-3 dark:border-slate-700">
                <p className="text-sm text-slate-900 dark:text-white">{f.content}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <FeedbackStatusBadge status={f.status} />
                  <span className="text-xs text-slate-500">{formatDate(f.createdAt)}</span>
                </div>
                {f.adminNote && (
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">Phản hồi: {f.adminNote}</p>
                )}
                {f.status === 'PENDING' && (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => updateFeedback.mutate({ feedbackId: f.id, status: 'APPROVED' })}
                      disabled={updateFeedback.isPending}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Đồng ý
                    </button>
                    <button
                      type="button"
                      onClick={() => updateFeedback.mutate({ feedbackId: f.id, status: 'REJECTED' })}
                      disabled={updateFeedback.isPending}
                      className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400"
                    >
                      Từ chối
                    </button>
                  </div>
                )}
                {(f.status === 'APPROVED' || f.status === 'REJECTED') && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const note = window.prompt('Cập nhật phản hồi (admin note):', f.adminNote ?? '')
                        if (note !== null) {
                          updateFeedback.mutate({ feedbackId: f.id, adminNote: note })
                        }
                      }}
                      disabled={updateFeedback.isPending}
                      className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                      Cập nhật phản hồi
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
