import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { LoginPage } from '@/pages/LoginPage'
import { PropertyListPage } from '@/pages/properties/PropertyListPage'
import { PropertyFormPage } from '@/pages/properties/PropertyFormPage'
import { RoomListPage } from '@/pages/rooms/RoomListPage'
import { AllRoomsPage } from '@/pages/rooms/AllRoomsPage'
import { RoomFormPage } from '@/pages/rooms/RoomFormPage'
import { RoomInvoicePage } from '@/pages/rooms/RoomInvoicePage'
import { OccupantsPage } from '@/pages/rooms/OccupantsPage'
import { OccupantDetailPage } from '@/pages/rooms/OccupantDetailPage'
import { RoomHistoryPage } from '@/pages/rooms/RoomHistoryPage'
import { PricingSettingsPage } from '@/pages/settings/PricingSettingsPage'
import { InvoiceListPage } from '@/pages/invoices/InvoiceListPage'
import { InvoiceDetailPage } from '@/pages/invoices/InvoiceDetailPage'
import { AdminUserListPage } from '@/pages/admin/AdminUserListPage'
import { AdminUserDetailPage } from '@/pages/admin/AdminUserDetailPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { ProfileEditPage } from '@/pages/ProfileEditPage'
import { HomeOrRedirect } from '@/pages/HomeOrRedirect'
import { AdminRoute } from '@/components/AdminRoute'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('access_token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export function AppRoutes() {
  return (
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
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
