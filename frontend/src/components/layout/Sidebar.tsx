import { NavLink } from 'react-router-dom'

type SidebarProps = {
  open: boolean
  onClose: () => void
}

const navItems = [
  { to: '/', label: 'Tổng quan' },
  { to: '/properties', label: 'Bất động sản' },
  { to: '/invoices', label: 'Hóa đơn' },
  { to: '/settings/pricing', label: 'Đơn giá' },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay on mobile */}
      {open && (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          aria-label="Đóng menu"
        />
      )}
      <aside
        className={`
          fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 transform border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out dark:border-slate-700 dark:bg-slate-800
          md:static md:translate-x-0 md:border-r
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-200 text-slate-900 dark:bg-slate-600 dark:text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
