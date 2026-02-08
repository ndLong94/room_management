import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  fetchOccupancyPeriods,
  fetchOccupancyPeriodOccupants,
} from '@/api/occupancyPeriods'
import { useProperty } from '@/hooks/useProperties'
import { useRoom } from '@/hooks/useRooms'
import { formatAmount, formatDate } from '@/utils'
import type { OccupancyPeriod, OccupancyPeriodOccupant } from '@/types/occupancyPeriod'

const DOC_BASE = import.meta.env.VITE_API_URL ?? ''

function periodLabel(p: OccupancyPeriod) {
  const from =
    p.startMonth != null && p.startYear != null
      ? `Tháng ${p.startMonth}/${p.startYear}`
      : '—'
  const to = `Tháng ${p.endMonth}/${p.endYear}`
  return `${from} → ${to}`
}

function OccupantInfoModal({
  occupant,
  onClose,
}: {
  occupant: OccupancyPeriodOccupant
  onClose: () => void
}) {
  const link = (url: string | null | undefined, label: string) =>
    url ? (
      <a
        href={url.startsWith('http') ? url : `${DOC_BASE}${url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sky-600 dark:text-sky-400"
      >
        {label}
      </a>
    ) : (
      <span className="text-slate-400">—</span>
    )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-lg dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Thông tin người ở (lịch sử)
        </h3>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Họ tên</dt>
            <dd className="font-medium text-slate-900 dark:text-white">{occupant.fullName}</dd>
          </div>
          {occupant.phone && (
            <div>
              <dt className="text-slate-500 dark:text-slate-400">SĐT</dt>
              <dd>{occupant.phone}</dd>
            </div>
          )}
          {occupant.idNumber && (
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Số CMND/CCCD</dt>
              <dd>{occupant.idNumber}</dd>
            </div>
          )}
          {occupant.address && (
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Địa chỉ</dt>
              <dd className="break-words">{occupant.address}</dd>
            </div>
          )}
          {occupant.dob && (
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Ngày sinh</dt>
              <dd>{occupant.dob}</dd>
            </div>
          )}
          {occupant.note && (
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Ghi chú</dt>
              <dd className="break-words">{occupant.note}</dd>
            </div>
          )}
          <div>
            <dt className="mb-1 text-slate-500 dark:text-slate-400">Tài liệu</dt>
            <dd className="flex flex-wrap gap-3">
              {link(occupant.avatarUrl, 'Hình cá nhân')}
              {link(occupant.idFrontUrl, 'CCCD mặt trước')}
              {link(occupant.idBackUrl, 'CCCD mặt sau')}
              {link(occupant.tempResidenceUrl, 'Tạm trú')}
            </dd>
          </div>
        </dl>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium dark:border-slate-600 dark:hover:bg-slate-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

export function RoomHistoryPage() {
  const { propertyId, roomId, periodId } = useParams<{
    propertyId: string
    roomId: string
    periodId?: string
  }>()
  const propId = propertyId ? parseInt(propertyId, 10) : null
  const rId = roomId ? parseInt(roomId, 10) : null
  const pId = periodId ? parseInt(periodId, 10) : null
  const [viewingOccupant, setViewingOccupant] = useState<OccupancyPeriodOccupant | null>(null)

  const { data: property } = useProperty(propId)
  const { data: room } = useRoom(propId, rId)
  const { data: periods, isLoading: loadingPeriods } = useQuery({
    queryKey: ['occupancy-periods', propId, rId],
    queryFn: () => fetchOccupancyPeriods(propId!, rId!),
    enabled: propId != null && rId != null,
  })
  const { data: periodOccupants, isLoading: loadingOccupants } = useQuery({
    queryKey: ['occupancy-period-occupants', propId, rId, pId],
    queryFn: () => fetchOccupancyPeriodOccupants(propId!, rId!, pId!),
    enabled: propId != null && rId != null && pId != null,
  })

  const currentPeriod = pId != null ? periods?.find((p) => p.id === pId) : null

  if (propId == null || rId == null) return <p className="text-red-600">Đường dẫn không hợp lệ.</p>
  if (!property) return <p className="text-slate-500">Đang tải…</p>
  if (!room) return <p className="text-slate-500">Đang tải phòng…</p>

  return (
    <div className="min-w-0">
      <Link
        to={`/properties/${propId}/rooms/${rId}/occupants`}
        className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        ← Người ở: {property.name} / {room.name}
      </Link>
      <h1 className="mt-2 mb-6 break-words text-xl font-bold sm:text-2xl">
        Lịch sử cho thuê {room.name}
      </h1>

      {!pId ? (
        <>
          {loadingPeriods && <p className="text-slate-500">Đang tải…</p>}
          {!loadingPeriods && (!periods?.length ? (
            <p className="rounded-lg border border-slate-200 bg-white py-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">
              Chưa có lịch sử cho thuê. Lịch sử được tạo khi bạn chuyển phòng từ Đã cho thuê sang Còn trống.
            </p>
          ) : (
            <ul className="space-y-2">
              {periods.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/properties/${propId}/rooms/${rId}/history/${p.id}`}
                    className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600"
                  >
                    <span className="font-medium">{periodLabel(p)}</span>
                    {(p.depositAmount != null || p.depositDate || p.paymentDay != null || p.contractUrl) && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {p.depositAmount != null && `Cọc: ${formatAmount(p.depositAmount)}`}
                        {p.depositAmount != null && (p.depositDate || p.paymentDay != null) && ' • '}
                        {p.depositDate && `Ngày cọc: ${formatDate(p.depositDate)}`}
                        {p.depositDate && p.paymentDay != null && ' • '}
                        {p.paymentDay != null && `Ngày thanh toán: ${p.paymentDay}`}
                        {((p.depositAmount != null) || p.depositDate || p.paymentDay != null) && p.contractUrl && ' • '}
                        {p.contractUrl && 'Có hợp đồng'}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </>
      ) : (
        <>
          {currentPeriod && (
            <div className="mb-4 space-y-2">
              <p className="text-slate-600 dark:text-slate-300">
                Kỳ: {periodLabel(currentPeriod)}
              </p>
              {(currentPeriod.depositAmount != null || currentPeriod.depositDate || currentPeriod.paymentDay != null || currentPeriod.contractUrl) && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800/50">
                  <p className="mb-1 font-medium text-slate-700 dark:text-slate-300">Thông tin đã lưu khi trả phòng</p>
                  <dl className="grid gap-1 text-slate-600 dark:text-slate-400 sm:grid-cols-2">
                    {currentPeriod.depositAmount != null && (
                      <><dt className="text-slate-500 dark:text-slate-400">Tiền đặt cọc</dt><dd>{formatAmount(currentPeriod.depositAmount)}</dd></>
                    )}
                    {currentPeriod.depositDate && (
                      <><dt className="text-slate-500 dark:text-slate-400">Ngày cọc</dt><dd>{formatDate(currentPeriod.depositDate)}</dd></>
                    )}
                    {currentPeriod.paymentDay != null && (
                      <><dt className="text-slate-500 dark:text-slate-400">Ngày thanh toán</dt><dd>Mỗi tháng ngày {currentPeriod.paymentDay}</dd></>
                    )}
                    {currentPeriod.contractUrl && (
                      <>
                        <dt className="text-slate-500 dark:text-slate-400">Hợp đồng</dt>
                        <dd>
                          <a
                            href={currentPeriod.contractUrl.startsWith('http') ? currentPeriod.contractUrl : `${DOC_BASE}${currentPeriod.contractUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-600 dark:text-sky-400"
                          >
                            Xem hợp đồng
                          </a>
                        </dd>
                      </>
                    )}
                  </dl>
                </div>
              )}
            </div>
          )}
          {loadingOccupants && <p className="text-slate-500">Đang tải danh sách người ở…</p>}
          {!loadingOccupants && (
            <>
              {!periodOccupants?.length ? (
                <p className="text-slate-500">Không có dữ liệu người ở cho kỳ này.</p>
              ) : (
                <div className="space-y-3">
                  {periodOccupants.map((o) => (
                    <div
                      key={o.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setViewingOccupant(o)}
                      onKeyDown={(e) => e.key === 'Enter' && setViewingOccupant(o)}
                      className="cursor-pointer rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600"
                    >
                      <p className="font-medium text-slate-900 dark:text-white">{o.fullName}</p>
                      {o.phone && (
                        <p className="text-sm text-slate-600 dark:text-slate-300">{o.phone}</p>
                      )}
                      {o.idNumber && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          CCCD: {o.idNumber}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Nhấp để xem thông tin
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          <Link
            to={`/properties/${propId}/rooms/${rId}/history`}
            className="mt-6 inline-block text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            ← Danh sách kỳ
          </Link>
        </>
      )}

      {viewingOccupant && (
        <OccupantInfoModal
          occupant={viewingOccupant}
          onClose={() => setViewingOccupant(null)}
        />
      )}
    </div>
  )
}
