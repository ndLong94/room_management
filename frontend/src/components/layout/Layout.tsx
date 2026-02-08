import { useState } from 'react'
import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { useCurrentUser } from '@/hooks/useCurrentUser'

/** Admin chỉ được xem: /admin/* và /profile. Các route khác redirect về /admin/users. */
function useAdminOnlyRedirect() {
  const { pathname } = useLocation()
  const { user, isLoading } = useCurrentUser()
  if (isLoading || !user || user.role !== 'ADMIN') return null
  const allowed = pathname.startsWith('/admin') || pathname.startsWith('/profile')
  if (!allowed) return <Navigate to="/admin/users" replace />
  return null
}

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useCurrentUser()
  const adminRedirect = useAdminOnlyRedirect()
  const toggleSidebar = () => setSidebarOpen((o) => !o)
  const closeSidebar = () => setSidebarOpen(false)

  if (adminRedirect) return adminRedirect

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <Navbar onMenuClick={toggleSidebar} />
      <div className="flex">
        <Sidebar open={sidebarOpen} onClose={closeSidebar} user={user} />
        <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
