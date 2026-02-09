import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { AdminRoute } from '@/components/AdminRoute'

const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const PropertyListPage = lazy(() => import('@/pages/properties/PropertyListPage').then((m) => ({ default: m.PropertyListPage })))
const PropertyFormPage = lazy(() => import('@/pages/properties/PropertyFormPage').then((m) => ({ default: m.PropertyFormPage })))
const RoomListPage = lazy(() => import('@/pages/rooms/RoomListPage').then((m) => ({ default: m.RoomListPage })))
const AllRoomsPage = lazy(() => import('@/pages/rooms/AllRoomsPage').then((m) => ({ default: m.AllRoomsPage })))
const RoomFormPage = lazy(() => import('@/pages/rooms/RoomFormPage').then((m) => ({ default: m.RoomFormPage })))
const RoomInvoicePage = lazy(() => import('@/pages/rooms/RoomInvoicePage').then((m) => ({ default: m.RoomInvoicePage })))
const OccupantsPage = lazy(() => import('@/pages/rooms/OccupantsPage').then((m) => ({ default: m.OccupantsPage })))
const OccupantDetailPage = lazy(() => import('@/pages/rooms/OccupantDetailPage').then((m) => ({ default: m.OccupantDetailPage })))
const RoomHistoryPage = lazy(() => import('@/pages/rooms/RoomHistoryPage').then((m) => ({ default: m.RoomHistoryPage })))
const PricingSettingsPage = lazy(() => import('@/pages/settings/PricingSettingsPage').then((m) => ({ default: m.PricingSettingsPage })))
const InvoiceListPage = lazy(() => import('@/pages/invoices/InvoiceListPage').then((m) => ({ default: m.InvoiceListPage })))
const InvoiceDetailPage = lazy(() => import('@/pages/invoices/InvoiceDetailPage').then((m) => ({ default: m.InvoiceDetailPage })))
const AdminUserListPage = lazy(() => import('@/pages/admin/AdminUserListPage').then((m) => ({ default: m.AdminUserListPage })))
const AdminUserDetailPage = lazy(() => import('@/pages/admin/AdminUserDetailPage').then((m) => ({ default: m.AdminUserDetailPage })))
const AdminFeedbackPage = lazy(() => import('@/pages/admin/AdminFeedbackPage').then((m) => ({ default: m.AdminFeedbackPage })))
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const ProfileEditPage = lazy(() => import('@/pages/ProfileEditPage').then((m) => ({ default: m.ProfileEditPage })))
const HomeOrRedirect = lazy(() => import('@/pages/HomeOrRedirect').then((m) => ({ default: m.HomeOrRedirect })))

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('access_token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export function AppRoutes() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-slate-500">Đang tải…</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomeOrRedirect />} />
        <Route path="properties" element={<PropertyListPage />} />
        <Route path="properties/new" element={<PropertyFormPage mode="new" />} />
        <Route path="properties/:id/edit" element={<PropertyFormPage mode="edit" />} />
        <Route path="properties/:propertyId/rooms" element={<RoomListPage />} />
        <Route path="properties/:propertyId/rooms/new" element={<RoomFormPage mode="new" />} />
        <Route path="properties/:propertyId/rooms/:roomId/edit" element={<RoomFormPage mode="edit" />} />
        <Route path="properties/:propertyId/rooms/:roomId/invoice" element={<RoomInvoicePage />} />
        <Route path="properties/:propertyId/rooms/:roomId/occupants" element={<OccupantsPage />} />
        <Route path="properties/:propertyId/rooms/:roomId/occupants/:occupantId" element={<OccupantDetailPage />} />
        <Route path="properties/:propertyId/rooms/:roomId/history" element={<RoomHistoryPage />} />
        <Route path="properties/:propertyId/rooms/:roomId/history/:periodId" element={<RoomHistoryPage />} />
        <Route path="settings/pricing" element={<PricingSettingsPage />} />
        <Route path="invoices" element={<InvoiceListPage />} />
        <Route path="invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="rooms" element={<AllRoomsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/edit" element={<ProfileEditPage />} />
        <Route path="admin/users" element={<AdminRoute><AdminUserListPage /></AdminRoute>} />
        <Route path="admin/users/:userId" element={<AdminRoute><AdminUserDetailPage /></AdminRoute>} />
        <Route path="admin/feedback" element={<AdminRoute><AdminFeedbackPage /></AdminRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
