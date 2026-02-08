import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchAdminUsers } from '@/api/admin'
import { useAdminFeedbackList, useUpdateFeedbackAdmin, useReplyAdminFeedback } from '@/hooks/useFeedback'
import { formatDate } from '@/utils'
import type { AdminFeedbackListItem } from '@/api/feedback'
import type { FeedbackStatus } from '@/types/feedback'

function FeedbackStatusBadge({ status }: { status: FeedbackStatus }) {
  const map: Record<FeedbackStatus, { label: string; className: string }> = {
    PENDING: { label: 'Chờ xử lý', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
    APPROVED: { label: 'Đồng ý', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    REJECTED: { label: 'Từ chối', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
    RESOLVED: { label: 'Đã giải quyết', className: 'bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-200' },
  }
  const { label, className } = map[status] ?? { label: status, className: '' }
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{label}</span>
}

function AdminFeedbackCard({
  feedback,
  updateFeedback,
  replyAdmin,
}: {
  feedback: AdminFeedbackListItem
  updateFeedback: ReturnType<typeof useUpdateFeedbackAdmin>
  replyAdmin: ReturnType<typeof useReplyAdminFeedback>
}) {
  const [replyContent, setReplyContent] = useState('')
  const f = feedback
  const conversation = f.conversation ?? []

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault()
    const t = replyContent.trim()
    if (!t) return
    replyAdmin.mutate({ feedbackId: f.id, content: t }, { onSuccess: () => setReplyContent('') })
  }

  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm text-slate-900 dark:text-white">{f.content}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <FeedbackStatusBadge status={f.status} />
            <span>{formatDate(f.createdAt?.slice(0, 10))}</span>
            {f.username != null && (
              <Link
                to={`/admin/users/${f.userId}`}
                className="text-sky-600 hover:underline dark:text-sky-400"
              >
                {f.username}
              </Link>
            )}
          </div>
          {f.adminNote && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Phản hồi: {f.adminNote}</p>
          )}
          {conversation.length > 0 && (
            <div className="mt-3 space-y-2 border-t border-slate-200 pt-3 dark:border-slate-600">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Hội thoại</p>
              {conversation.map((msg, i) => (
                <div
                  key={i}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    msg.role === 'admin' ? 'bg-slate-100 dark:bg-slate-700/50' : 'bg-sky-50 dark:bg-sky-900/20'
                  }`}
                >
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {msg.role === 'admin' ? 'Admin' : 'User'}
                  </span>
                  <span className="ml-2 text-xs text-slate-500">{formatDate(msg.createdAt?.slice(0, 10))}</span>
                  <p className="mt-0.5 text-slate-900 dark:text-white">{msg.content}</p>
                </div>
              ))}
            </div>
          )}
          {f.status !== 'RESOLVED' && (
            <form onSubmit={handleReply} className="mt-3 w-full min-w-0 border-t border-slate-200 pt-3 dark:border-slate-600">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Phản hồi lại user..."
                rows={2}
                maxLength={2000}
                className="mb-2 min-h-[4rem] w-full min-w-0 resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
              <button
                type="submit"
                disabled={replyAdmin.isPending || !replyContent.trim()}
                className="min-h-[2.75rem] min-w-[8rem] rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-600"
              >
                {replyAdmin.isPending ? 'Đang gửi…' : 'Gửi phản hồi'}
              </button>
            </form>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-nowrap">
          {f.status === 'PENDING' && (
            <>
              <button
                type="button"
                onClick={() => updateFeedback.mutate({ feedbackId: f.id, status: 'APPROVED' })}
                disabled={updateFeedback.isPending}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Đồng ý
              </button>
              <button
                type="button"
                onClick={() => updateFeedback.mutate({ feedbackId: f.id, status: 'REJECTED' })}
                disabled={updateFeedback.isPending}
                className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400"
              >
                Từ chối
              </button>
            </>
          )}
          {(f.status === 'APPROVED' || f.status === 'REJECTED') && (
            <>
              <button
                type="button"
                onClick={() => updateFeedback.mutate({ feedbackId: f.id, status: 'RESOLVED' })}
                disabled={updateFeedback.isPending}
                className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-600 disabled:opacity-50 dark:bg-slate-600"
              >
                Đã giải quyết
              </button>
              <button
                type="button"
                onClick={() => {
                  const note = window.prompt('Cập nhật phản hồi (admin note):', f.adminNote ?? '')
                  if (note !== null) {
                    updateFeedback.mutate({ feedbackId: f.id, adminNote: note })
                  }
                }}
                disabled={updateFeedback.isPending}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cập nhật phản hồi
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  )
}

export function AdminFeedbackPage() {
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | ''>('')
  const [userIdFilter, setUserIdFilter] = useState<number | ''>('')

  const { data: usersPage } = useQuery({
    queryKey: ['admin', 'users', 'list-for-feedback'],
    queryFn: () => fetchAdminUsers({ page: 0, size: 200 }),
  })
  const users = usersPage?.content ?? []

  const { data: feedbacks = [], isLoading, error } = useAdminFeedbackList({
    status: statusFilter || undefined,
    userId: userIdFilter === '' ? undefined : userIdFilter,
  })
  const updateFeedback = useUpdateFeedbackAdmin()
  const replyAdmin = useReplyAdminFeedback()

  return (
    <div className="min-w-0">
      <Link
        to="/admin/users"
        className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        ← Quản lý user
      </Link>
      <h1 className="mt-2 mb-6 text-xl font-bold sm:text-2xl">Ý kiến người dùng</h1>

      <div className="mb-6 flex min-w-0 flex-wrap items-center gap-3 sm:gap-4">
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter((e.target.value || '') as FeedbackStatus | '')}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          >
            <option value="">Tất cả</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="APPROVED">Đồng ý</option>
            <option value="REJECTED">Từ chối</option>
            <option value="RESOLVED">Đã giải quyết</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">User:</span>
          <select
            value={userIdFilter === '' ? '' : userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value === '' ? '' : Number(e.target.value))}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm sm:min-w-[10rem] sm:flex-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          >
            <option value="">Tất cả</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username} (id: {u.id})
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading && <p className="text-slate-500">Đang tải…</p>}
      {error && <p className="text-red-600">Không tải được danh sách ý kiến.</p>}

      {!isLoading && !error && (
        feedbacks.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-white py-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">
            Chưa có ý kiến nào.
          </p>
        ) : (
          <ul className="space-y-4">
            {feedbacks.map((f: AdminFeedbackListItem) => (
              <AdminFeedbackCard
                key={f.id}
                feedback={f}
                updateFeedback={updateFeedback}
                replyAdmin={replyAdmin}
              />
            ))}
          </ul>
        )
      )}
    </div>
  )
}
