import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useProperty } from '@/hooks/useProperties'
import { useDeleteRoom, useRooms } from '@/hooks/useRooms'
import { fetchOccupants } from '@/api/occupants'

export function RoomListPage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const id = propertyId ? parseInt(propertyId, 10) : null
  const navigate = useNavigate()

  const { data: property, isLoading: loadingProperty } = useProperty(id)
  const { data: rooms, isLoading: loadingRooms, error } = useRooms(id)
  const deleteRoom = useDeleteRoom(id ?? 0)

  const handleDelete = async (roomId: number, name: string) => {
    const room = rooms?.find((r) => r.id === roomId)
    if (room?.status === 'OCCUPIED' && id != null) {
      try {
        const occupants = await fetchOccupants(id, roomId)
        if (occupants.length > 0) {
          toast.error(
            'Không thể xóa phòng đang cho thuê và có người ở. Vui lòng chuyển trạng thái phòng hoặc xóa/chuyển người ở trước.'
          )
          return
        }
      } catch {
        // ignore
      }
    }
    if (window.confirm(`Xóa phòng "${name}"?`)) {
      deleteRoom.mutate(roomId)
    }
  }

  const statusLabel = (s: string) => (s === 'OCCUPIED' ? 'Đã cho thuê' : 'Còn trống')
  const paymentDayDisplay = (r: { paymentDay?: number | null }) => (r.paymentDay != null ? r.paymentDay : 1)

  if (id == null) return <p className="text-red-600">Bất động sản không hợp lệ.</p>
  if (loadingProperty) return <p className="text-slate-500">Đang tải…</p>
  if (!property) return <p className="text-red-600">Không tìm thấy bất động sản.</p>
  if (loadingRooms) return <p className="text-slate-500">Đang tải phòng…</p>
  if (error) return <p className="text-red-600">Không tải được danh sách phòng.</p>

  return (
    <div className="min-w-0">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link
            to="/properties"
            className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            ← Bất động sản
          </Link>
          <h1 className="mt-1 break-words text-xl font-bold sm:text-2xl">Phòng: {property.name}</h1>
        </div>
        <Link
          to={`/properties/${id}/rooms/new`}
          className="shrink-0 rounded-lg bg-slate-800 px-4 py-2 text-center text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500"
        >
          Thêm phòng
        </Link>
      </div>

      {/* Mobile: card list */}
      <div className="space-y-3 md:hidden">
        {!rooms?.length ? (
          <p className="rounded-lg border border-slate-200 bg-white py-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">
            Chưa có phòng. Thêm mới để bắt đầu.
          </p>
        ) : (
          rooms.map((r) => (
            <div
              key={r.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/properties/${id}/rooms/${r.id}/occupants`)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/properties/${id}/rooms/${r.id}/occupants`)}
              className="min-w-0 cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">{r.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {typeof r.rentPrice === 'number' ? r.rentPrice.toLocaleString() : r.rentPrice} đ/tháng
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    r.status === 'OCCUPIED'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                  }`}
                >
                  {statusLabel(r.status)}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Ngày thanh toán: {paymentDayDisplay(r)}
              </p>
              <div
                className="mt-3 flex flex-wrap gap-2 border-t border-slate-200 pt-3 dark:border-slate-700"
                onClick={(e) => e.stopPropagation()}
              >
                <Link
                  to={`/properties/${id}/rooms/${r.id}/occupants`}
                  className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Người ở
                </Link>
                <Link
                  to={`/properties/${id}/rooms/${r.id}/invoice`}
                  className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Hóa đơn
                </Link>
                <button
                  type="button"
                  onClick={() => navigate(`/properties/${id}/rooms/${r.id}/edit`)}
                  className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Sửa
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(r.id, r.name)}
                  className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden min-w-0 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 md:block">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Tên
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Tiền thuê
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Ngày thanh toán
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-800/50">
            {!rooms?.length ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Chưa có phòng. Thêm mới để bắt đầu.
                </td>
              </tr>
            ) : (
              rooms.map((r) => (
                <tr
                  key={r.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/properties/${id}/rooms/${r.id}/occupants`)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/properties/${id}/rooms/${r.id}/occupants`)}
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{r.name}</td>
                  <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                    {typeof r.rentPrice === 'number' ? r.rentPrice.toLocaleString() : r.rentPrice}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.status === 'OCCUPIED'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                      }`}
                    >
                      {statusLabel(r.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300">
                    {paymentDayDisplay(r)}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <Link
                      to={`/properties/${id}/rooms/${r.id}/occupants`}
                      className="mr-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                      Người ở
                    </Link>
                    <Link
                      to={`/properties/${id}/rooms/${r.id}/invoice`}
                      className="mr-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                      Hóa đơn
                    </Link>
                    <button
                      type="button"
                      onClick={() => navigate(`/properties/${id}/rooms/${r.id}/edit`)}
                      className="mr-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id, r.name)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
