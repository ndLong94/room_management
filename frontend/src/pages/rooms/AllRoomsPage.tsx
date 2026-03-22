import { useEffect, useState } from 'react'
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useProperties } from '@/hooks/useProperties'
import { fetchRooms, deleteRoom } from '@/api/rooms'
import { fetchOccupants } from '@/api/occupants'
import type { Room, RoomStatus } from '@/types/room'
import { formatMoney, getErrorMessageVi } from '@/utils'

const PAGE_SIZE = 10

type RoomWithProperty = Room & { propertyId: number; propertyName: string }

function parseRoomStatus(s: string | null): RoomStatus | '' {
  if (s === 'OCCUPIED' || s === 'VACANT') return s
  return ''
}

export function AllRoomsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const statusFilter = parseRoomStatus(searchParams.get('status'))
  const [searchQuery, setSearchQuery] = useState('')
  const [propertyIdFilter, setPropertyIdFilter] = useState<number | ''>('')
  const [page, setPage] = useState(1)
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: properties, isLoading: loadingProperties, error: errorProperties } = useProperties()
  const roomQueries = useQueries({
    queries: (properties ?? []).map((p) => ({
      queryKey: ['properties', p.id, 'rooms'],
      queryFn: () => fetchRooms(p.id),
      enabled: !!properties?.length,
    })),
  })

  const deleteRoomMutation = useMutation({
    mutationFn: ({ propertyId, roomId }: { propertyId: number; roomId: number }) =>
      deleteRoom(propertyId, roomId),
    onSuccess: (_, { propertyId }) => {
      queryClient.invalidateQueries({ queryKey: ['properties', propertyId, 'rooms'] })
      toast.success('Đã xóa phòng')
    },
    onError: (err: unknown) => toast.error(getErrorMessageVi(err, 'Không thể xóa phòng')),
  })

  const isLoading = loadingProperties || roomQueries.some((q) => q.isLoading)
  const error = errorProperties || roomQueries.find((q) => q.error)?.error

  const roomsWithProperty: RoomWithProperty[] = []
  if (properties) {
    roomQueries.forEach((q, i) => {
      const p = properties[i]
      const list = (q.data ?? []) as (Room & { propertyId?: number })[]
      list.forEach((r) => {
        roomsWithProperty.push({
          ...r,
          propertyId: p.id,
          propertyName: p.name,
        })
      })
    })
  }
  const filteredRooms = roomsWithProperty.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false
    if (propertyIdFilter !== '' && r.propertyId !== propertyIdFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      if (!r.name.toLowerCase().includes(q) && !r.propertyName.toLowerCase().includes(q)) return false
    }
    return true
  })
  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginatedRooms = filteredRooms.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  useEffect(() => {
    if (page > totalPages && totalPages >= 1) setPage(totalPages)
  }, [totalPages, page])

  const statusLabel = (s: string) => (s === 'OCCUPIED' ? 'Đã cho thuê' : 'Còn trống')

  const setStatusInUrl = (s: RoomStatus | '') => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (s === '') next.delete('status')
      else next.set('status', s)
      return next
    })
    setPage(1)
  }

  const handleDelete = async (r: RoomWithProperty) => {
    if (r.status === 'OCCUPIED') {
      try {
        const occupants = await fetchOccupants(r.propertyId, r.id)
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
    if (window.confirm(`Xóa phòng "${r.name}"?`)) {
      deleteRoomMutation.mutate({ propertyId: r.propertyId, roomId: r.id })
    }
  }

  if (loadingProperties) return <p className="text-slate-500">Đang tải…</p>
  if (errorProperties) return <p className="text-red-600">Không tải được danh sách bất động sản.</p>
  if (error) return <p className="text-red-600">Không tải được danh sách phòng.</p>

  const title =
    statusFilter === 'OCCUPIED'
      ? 'Phòng đã cho thuê'
      : statusFilter === 'VACANT'
        ? 'Phòng còn trống'
        : 'Tất cả phòng'

  return (
    <div className="min-w-0">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link
            to="/"
            className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            ← Tổng quan
          </Link>
          <h1 className="mt-1 break-words text-xl font-bold sm:text-2xl">{title}</h1>
        </div>
        {!statusFilter && (
          <Link
            to="/properties"
            className="shrink-0 rounded-lg bg-slate-800 px-4 py-2 text-center text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500"
          >
            Bất động sản
          </Link>
        )}
      </div>

      {!isLoading && (
        <>
          <div className="mb-4 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="flex items-end gap-3">
              <div className="relative min-w-[9rem] sm:w-48">
                <label className="mb-1 block text-xs font-medium text-slate-500">Trạng thái</label>
                <select
                  value={statusFilter === '' ? '' : statusFilter}
                  onChange={(e) => setStatusInUrl((e.target.value === '' ? '' : e.target.value) as RoomStatus | '')}
                  className="w-full min-w-0 appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-8 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                >
                  <option value="">Tất cả</option>
                  <option value="OCCUPIED">Đã cho thuê</option>
                  <option value="VACANT">Còn trống</option>
                </select>
                <span className="pointer-events-none absolute right-2 top-[30px] flex items-center text-slate-400 dark:text-slate-300">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFiltersExpanded((e) => !e)}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                style={{ height: '42px' }}
              >
                <span className="text-base leading-none">{filtersExpanded ? '−' : '+'}</span>
                <span>{filtersExpanded ? 'Thu gọn' : 'Thêm bộ lọc'}</span>
              </button>
            </div>
            {filtersExpanded && (
              <div className="mt-3 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="min-w-0 md:min-w-[200px] md:flex-1">
                  <label className="mb-1 block text-xs font-medium text-slate-500">Tìm kiếm</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
                    placeholder="Tên phòng hoặc BĐS..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div className="min-w-0">
                  <label className="mb-1 block text-xs font-medium text-slate-500">Bất động sản</label>
                  <select
                    value={propertyIdFilter === '' ? '' : propertyIdFilter}
                    onChange={(e) => { setPropertyIdFilter(e.target.value === '' ? '' : Number(e.target.value)); setPage(1) }}
                    className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  >
                    <option value="">Tất cả</option>
                    {properties?.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Mobile: card list */}
          <div className="space-y-3 md:hidden">
            {!paginatedRooms.length ? (
              <p className="rounded-lg border border-slate-200 bg-white py-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">
                {filteredRooms.length === 0
                  ? (statusFilter ? `Không có phòng ${statusFilter === 'OCCUPIED' ? 'đã cho thuê' : 'còn trống'}.` : 'Chưa có phòng.')
                  : 'Không có kết quả nào ở trang này.'}
              </p>
            ) : (
              paginatedRooms.map((r) => (
                <div
                  key={`${r.propertyId}-${r.id}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/properties/${r.propertyId}/rooms/${r.id}/occupants`)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && navigate(`/properties/${r.propertyId}/rooms/${r.id}/occupants`)
                  }
                  className="min-w-0 cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600"
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400">{r.propertyName}</p>
                  <p className="font-medium text-slate-900 dark:text-white">{r.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {formatMoney(r.rentPrice)} đ/tháng
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.status === 'OCCUPIED'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                    }`}
                  >
                    {statusLabel(r.status)}
                  </span>
                  <div
                    className="mt-3 flex flex-wrap gap-2 border-t border-slate-200 pt-3 dark:border-slate-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      to={`/properties/${r.propertyId}/rooms/${r.id}/invoice`}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      Hóa đơn
                    </Link>
                    <button
                      type="button"
                      onClick={() => navigate(`/properties/${r.propertyId}/rooms/${r.id}/edit`)}
                      className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500"
                    >
                      Cập nhật
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(r)}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                    >
                      Xóa phòng
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop: table */}
          <div className="hidden min-w-0 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 md:block">
            <table className="min-w-full table-auto divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                    Bất động sản
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                    Phòng
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                    Tiền thuê
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-800/50">
                {!paginatedRooms.length ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      {filteredRooms.length === 0
                        ? (statusFilter ? `Không có phòng ${statusFilter === 'OCCUPIED' ? 'đã cho thuê' : 'còn trống'}.` : 'Chưa có phòng.')
                        : 'Không có kết quả nào ở trang này.'}
                    </td>
                  </tr>
                ) : (
                  paginatedRooms.map((r) => (
                    <tr
                      key={`${r.propertyId}-${r.id}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/properties/${r.propertyId}/rooms/${r.id}/occupants`)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && navigate(`/properties/${r.propertyId}/rooms/${r.id}/occupants`)
                      }
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.propertyName}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{r.name}</td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                        {formatMoney(r.rentPrice)}
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
                      <td className="whitespace-nowrap px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-wrap justify-end gap-1">
                          <Link
                            to={`/properties/${r.propertyId}/rooms/${r.id}/occupants`}
                            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                          >
                            Người ở
                          </Link>
                          <Link
                            to={`/properties/${r.propertyId}/rooms/${r.id}/invoice`}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                          >
                            Hóa đơn
                          </Link>
                          <button
                            type="button"
                            onClick={() => navigate(`/properties/${r.propertyId}/rooms/${r.id}/edit`)}
                            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                          >
                            Cập nhật
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(r)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Xóa phòng
                          </button>
                        </div>
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
                Trang {safePage} / {totalPages} ({filteredRooms.length} kết quả)
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
        </>
      )}
      <div className="mt-6">
        <Link
          to="/"
          className="inline-block rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
        >
          Quay lại
        </Link>
      </div>
    </div>
  )
}
