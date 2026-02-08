import { Navigate } from 'react-router-dom'
import { useCurrentUser } from '@/hooks/useCurrentUser'

/**
 * Chỉ cho phép user có role ADMIN vào. User thường sẽ bị redirect về trang chủ.
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useCurrentUser()

  if (isLoading) return <p className="p-4 text-slate-500">Đang tải…</p>
  if (!user || user.role !== 'ADMIN') return <Navigate to="/" replace />
  return <>{children}</>
}
