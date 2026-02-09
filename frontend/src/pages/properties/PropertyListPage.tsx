import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getErrorMessageVi } from '@/utils'
import { useDeleteProperty, useProperties } from '@/hooks/useProperties'

const PAGE_SIZE = 10

export function PropertyListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const { data: properties, isLoading, error } = useProperties()
  const deleteProperty = useDeleteProperty()

  const totalPages = Math.max(1, Math.ceil((properties?.length ?? 0) / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = (properties ?? []).slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  useEffect(() => {
    if (page > totalPages && totalPages >= 1) setPage(totalPages)
  }, [totalPages, page])

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Xóa "${name}"?`)) return
    
    // Check if property has occupied rooms
    try {
      const { fetchRooms } = await import('@/api/rooms')
      const rooms = await fetchRooms(id)
      const hasOccupied = rooms.some(r => r.status === 'OCCUPIED')
      if (hasOccupied) {
        toast.error('Không thể xóa bất động sản khi có phòng đang cho thuê. Vui lòng chuyển trạng thái các phòng sang "Còn trống" trước khi xóa.')
        return
      }
    } catch (err) {
      // If error fetching rooms, still try to delete (backend will validate)
    }
    
    deleteProperty.mutate(id, {
      onError: (err: any) => {
        toast.error(getErrorMessageVi(err, 'Không thể xóa bất động sản này.'))
      },
    })
  }

  if (isLoading) return <p className="text-slate-500">Đang tải…</p>
  if (error) return <p className="text-red-600">Không tải được danh sách bất động sản.</p>

  return (
    <div className="min-w-0">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="min-w-0 break-words text-xl font-bold sm:text-2xl">Bất động sản</h1>
        <Link
          to="/properties/new"
          className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
        >
          Thêm bất động sản
        </Link>
      </div>

      {/* Mobile: card list */}
      <div className="space-y-3 md:hidden">
        {!paginated.length ? (
          <p className="rounded-lg border border-slate-200 bg-white py-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">
            Chưa có bất động sản. Thêm mới để bắt đầu.
          </p>
        ) : (
          paginated.map((p) => (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/properties/${p.id}/rooms`)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/properties/${p.id}/rooms`)}
              className="min-w-0 cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600"
            >
              <p className="font-medium text-slate-900 dark:text-white">{p.name}</p>
              {p.address ? (
                <p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-300">{p.address}</p>
              ) : null}
              {p.note ? (
                <p className="mt-1 line-clamp-3 break-words text-sm text-slate-500 dark:text-slate-400">
                  {p.note}
                </p>
              ) : null}
              <div
                className="mt-3 flex flex-wrap gap-2 border-t border-slate-200 pt-3 dark:border-slate-700"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => navigate(`/properties/${p.id}/edit`)}
                  className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500"
                >
                  Cập nhật
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id, p.name)}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                >
                  Xóa bất động sản
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden min-w-0 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 md:block">
        <table className="min-w-full table-fixed divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="w-[20%] px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Tên
              </th>
              <th className="w-[25%] px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Địa chỉ
              </th>
              <th className="w-[35%] min-w-0 px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Ghi chú
              </th>
              <th className="w-[20%] px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-800/50">
            {!paginated.length ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Chưa có bất động sản. Thêm mới để bắt đầu.
                </td>
              </tr>
            ) : (
              paginated.map((p) => (
                <tr
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/properties/${p.id}/rooms`)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/properties/${p.id}/rooms`)}
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <td className="min-w-0 truncate px-4 py-3 font-medium text-slate-900 dark:text-white">
                    {p.name}
                  </td>
                  <td className="min-w-0 truncate px-4 py-3 text-slate-600 dark:text-slate-300">
                    {p.address || '—'}
                  </td>
                  <td className="min-w-0 max-w-0 px-4 py-3">
                    <span className="line-clamp-2 block break-words text-slate-600 dark:text-slate-300" title={p.note || undefined}>
                      {p.note || '—'}
                    </span>
                  </td>
                  <td className="shrink-0 px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => navigate(`/properties/${p.id}/edit`)}
                      className="mr-2 rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500"
                    >
                      Cập nhật
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, p.name)}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                    >
                      Xóa bất động sản
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-slate-600"
          >
            Trước
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-300">
            Trang {safePage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-slate-600"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  )
}
