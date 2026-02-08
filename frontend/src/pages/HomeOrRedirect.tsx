import { Navigate } from 'react-router-dom'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { DashboardPage } from '@/pages/DashboardPage'

/** For admin: redirect to user management. For user: show dashboard. */
export function HomeOrRedirect() {
  const { user, isLoading } = useCurrentUser()
  if (isLoading) return <p className="text-slate-500">Đang tải…</p>
  if (user?.role === 'ADMIN') return <Navigate to="/admin/users" replace />
  return <DashboardPage />
}
