import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useMyFeedback, useCreateFeedback, useUpdateMyFeedback, useDeleteMyFeedback, useReplyMyFeedback } from '@/hooks/useFeedback'
import { formatDate } from '@/utils'
import type { Feedback, FeedbackStatus } from '@/types/feedback'

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

function FeedbackItem({
  feedback,
  editingId,
  editContent,
  onStartEdit,
  onCancelEdit,
  onEditContentChange,
  onSaveEdit,
  onDelete,
  onReply,
  isSaving,
  isDeleting,
  isReplying,
}: {
  feedback: Feedback
  editingId: number | null
  editContent: string
  onStartEdit: (id: number, content: string) => void
  onCancelEdit: () => void
  onEditContentChange: (v: string) => void
  onSaveEdit: () => void
  onDelete: (id: number) => void
  onReply: (feedbackId: number, content: string) => void
  isSaving: boolean
  isDeleting: boolean
  isReplying: boolean
}) {
  const [replyContent, setReplyContent] = useState('')
  const isEditing = editingId === feedback.id
  const canEditDelete = feedback.status === 'PENDING'
  const canReply = feedback.status !== 'RESOLVED'
  const conversation = feedback.conversation ?? []

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault()
    const t = replyContent.trim()
    if (!t) return
    onReply(feedback.id, t)
    setReplyContent('')
  }

  return (
    <li className="min-w-0 rounded-lg border border-slate-100 p-3 dark:border-slate-700">
      {isEditing ? (
        <>
          <textarea
            value={editContent}
            onChange={(e) => onEditContentChange(e.target.value)}
            rows={3}
            maxLength={2000}
            className="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
          <div className="flex flex-wrap gap-2 text-sm">
            <button
              type="button"
              onClick={onSaveEdit}
              disabled={isSaving || !editContent.trim()}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-600"
            >
              {isSaving ? 'Đang lưu…' : 'Lưu'}
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={isSaving}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Hủy
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="break-words text-sm text-slate-900 dark:text-white">{feedback.content}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <FeedbackStatusBadge status={feedback.status} />
            <span>{formatDate(feedback.createdAt?.slice(0, 10))}</span>
            {canEditDelete && (
              <>
                <button
                  type="button"
                  onClick={() => onStartEdit(feedback.id, feedback.content)}
                  className="text-slate-600 hover:underline dark:text-slate-400"
                >
                  Sửa
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(feedback.id)}
                  disabled={isDeleting}
                  className="text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                >
                  Xóa
                </button>
              </>
            )}
            {feedback.adminNote && (
              <span className="w-full text-slate-600 dark:text-slate-400">Phản hồi: {feedback.adminNote}</span>
            )}
          </div>
          {conversation.length > 0 && (
            <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-600">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Hội thoại</p>
              {conversation.map((msg, i) => (
                <div
                  key={i}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    msg.role === 'admin'
                      ? 'bg-slate-100 dark:bg-slate-700/50'
                      : 'bg-sky-50 dark:bg-sky-900/20'
                  }`}
                >
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {msg.role === 'admin' ? 'Admin' : 'Bạn'}
                  </span>
                  <span className="ml-2 text-xs text-slate-500">{formatDate(msg.createdAt?.slice(0, 10))}</span>
                  <p className="mt-0.5 text-slate-900 dark:text-white">{msg.content}</p>
                </div>
              ))}
            </div>
          )}
          {canReply && (
            <form onSubmit={handleReply} className="mt-3 w-full min-w-0 border-t border-slate-100 pt-3 dark:border-slate-600">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Phản hồi lại..."
                rows={2}
                maxLength={2000}
                className="mb-2 min-h-[4rem] w-full min-w-0 resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
              <button
                type="submit"
                disabled={isReplying || !replyContent.trim()}
                className="min-h-[2.75rem] min-w-[8rem] rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-600"
              >
                {isReplying ? 'Đang gửi…' : 'Gửi phản hồi'}
              </button>
            </form>
          )}
        </>
      )}
    </li>
  )
}

export function ProfilePage() {
  const { user, isLoading, error } = useCurrentUser()
  const { data: feedbacks = [], isLoading: feedbackLoading } = useMyFeedback()
  const createFeedback = useCreateFeedback()
  const updateMyFeedback = useUpdateMyFeedback()
  const deleteMyFeedback = useDeleteMyFeedback()
  const replyMyFeedback = useReplyMyFeedback()
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')

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

      {/* Đóng góp ý kiến — ẩn với admin (admin dùng màn Ý kiến trong khu vực admin) */}
      {user.role !== 'ADMIN' && (
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
              <FeedbackItem
                key={f.id}
                feedback={f}
                editingId={editingId}
                editContent={editContent}
                onStartEdit={(id, content) => {
                  setEditingId(id)
                  setEditContent(content)
                }}
                onCancelEdit={() => {
                  setEditingId(null)
                  setEditContent('')
                }}
                onEditContentChange={setEditContent}
                onSaveEdit={() => {
                  if (editingId == null || !editContent.trim()) return
                  updateMyFeedback.mutate(
                    { feedbackId: editingId, content: editContent.trim() },
                    { onSuccess: () => { setEditingId(null); setEditContent('') } }
                  )
                }}
                onDelete={(id) => {
                  if (!window.confirm('Xóa ý kiến này?')) return
                  deleteMyFeedback.mutate(id)
                }}
                onReply={(id, replyContent) => {
                  replyMyFeedback.mutate({ feedbackId: id, content: replyContent })
                }}
                isSaving={updateMyFeedback.isPending}
                isDeleting={deleteMyFeedback.isPending}
                isReplying={replyMyFeedback.isPending}
              />
            ))}
          </ul>
        )}
      </div>
      )}
    </div>
  )
}
