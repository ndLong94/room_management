import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useMyFeedback, useCreateFeedback } from '@/hooks/useFeedback'
import { formatDate } from '@/utils'
import type { FeedbackStatus } from '@/types/feedback'

function FeedbackStatusBadge({ status }: { status: FeedbackStatus }) {
  const map: Record<FeedbackStatus, { label: string; className: string }> = {
    PENDING: { label: 'Chờ xử lý', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
    APPROVED: { label: 'Đồng ý', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    REJECTED: { label: 'Từ chối', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  }
  const { label, className } = map[status]
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{label}</span>
}

export function ProfilePage() {
  const { user, isLoading, error } = useCurrentUser()
  const { data: feedbacks = [], isLoading: feedbackLoading } = useMyFeedback()
  const createFeedback = useCreateFeedback()
  const [content, setContent] = useState('')

  if (isLoading) return <p className="text-slate-500">Đang tải…</p>
  if (error || !user) return <p className="text-red-600">Không tải được thông tin tài khoản.</p>

  const roleLabel = user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault()
    const t = content.trim()
    if (!t) return
    createFeedback.mutate({ content: t }, { onSuccess: () => setContent('') })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Thông tin cá nhân</h1>
        <Link
          to="/profile/edit"
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-600"
        >
          Cập nhật
        </Link>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Tên đăng nhập</dt>
            <dd className="mt-1 text-slate-900 dark:text-white">{user.username}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Email</dt>
            <dd className="mt-1 text-slate-900 dark:text-white">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Vai trò</dt>
            <dd className="mt-1 text-slate-900 dark:text-white">{roleLabel}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Ngày tạo tài khoản</dt>
            <dd className="mt-1 text-slate-900 dark:text-white">
              {formatDate(user.createdAt?.slice(0, 10)) || user.createdAt}
            </dd>
          </div>
        </dl>
      </div>

      {/* Đóng góp ý kiến */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-lg font-semibold">Đóng góp ý kiến</h2>
        <form onSubmit={handleSubmitFeedback} className="mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập ý kiến của bạn..."
            rows={3}
            maxLength={2000}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">{content.length}/2000</span>
            <button
              type="submit"
              disabled={createFeedback.isPending || !content.trim()}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-600"
            >
              {createFeedback.isPending ? 'Đang gửi…' : 'Gửi ý kiến'}
            </button>
          </div>
        </form>
        <h3 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">Ý kiến đã gửi</h3>
        {feedbackLoading && <p className="text-sm text-slate-500">Đang tải…</p>}
        {!feedbackLoading && feedbacks.length === 0 && (
          <p className="text-sm text-slate-500">Chưa có ý kiến nào.</p>
        )}
        {!feedbackLoading && feedbacks.length > 0 && (
          <ul className="space-y-3">
            {feedbacks.map((f) => (
              <li
                key={f.id}
                className="rounded-lg border border-slate-100 p-3 dark:border-slate-700"
              >
                <p className="text-sm text-slate-900 dark:text-white">{f.content}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <FeedbackStatusBadge status={f.status} />
                  <span>{formatDate(f.createdAt?.slice(0, 10))}</span>
                  {f.adminNote && (
                    <span className="w-full text-slate-600 dark:text-slate-400">Phản hồi: {f.adminNote}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
