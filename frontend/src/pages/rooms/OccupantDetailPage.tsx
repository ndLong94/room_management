import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useProperty } from '@/hooks/useProperties'
import { useOccupant } from '@/hooks/useOccupants'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

type DocKey = 'avatarUrl' | 'idFrontUrl' | 'idBackUrl' | 'tempResidenceUrl'

function fullUrl(url: string | null | undefined): string {
  if (!url) return ''
  return url.startsWith('http') ? url : `${API_BASE.replace(/\/$/, '')}${url}`
}

const DOC_LABELS: Record<DocKey, string> = {
  avatarUrl: 'Hình cá nhân',
  idFrontUrl: 'CCCD mặt trước',
  idBackUrl: 'CCCD mặt sau',
  tempResidenceUrl: 'Tạm trú tạm vắng',
}

export function OccupantDetailPage() {
  const { propertyId, roomId, occupantId } = useParams<{
    propertyId: string
    roomId: string
    occupantId: string
  }>()
  const propId = propertyId ? parseInt(propertyId, 10) : null
  const rId = roomId ? parseInt(roomId, 10) : null
  const occId = occupantId ? parseInt(occupantId, 10) : null

  const [selectedDoc, setSelectedDoc] = useState<DocKey>('avatarUrl')

  const { data: property } = useProperty(propId)
  const { data: occupant, isLoading, error } = useOccupant(occId)

  if (propId == null || rId == null || occId == null) {
    return <p className="text-red-600">Đường dẫn không hợp lệ.</p>
  }
  if (!property) return <p className="text-slate-500">Đang tải…</p>
  if (isLoading) return <p className="text-slate-500">Đang tải…</p>
  if (error || !occupant) {
    return <p className="text-red-600">Không tìm thấy người ở.</p>
  }

  const currentSrc = fullUrl(occupant[selectedDoc])
  const isPdf = currentSrc.toLowerCase().includes('.pdf')

  return (
    <div className="min-w-0">
      <Link
        to={`/properties/${propId}/rooms/${rId}/occupants`}
        className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        ← Người ở
      </Link>
      <h1 className="mt-2 mb-6 break-words text-xl font-bold sm:text-2xl">{occupant.fullName}</h1>

      <div className="space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-3 font-semibold">Thông tin</h2>
          <dl className="grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">SĐT</dt>
              <dd className="text-slate-900 dark:text-white">{occupant.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">CMND/CCCD</dt>
              <dd className="text-slate-900 dark:text-white">{occupant.idNumber ?? '—'}</dd>
            </div>
            {occupant.address ? (
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-500">Địa chỉ</dt>
                <dd className="break-words text-slate-900 dark:text-white">{occupant.address}</dd>
              </div>
            ) : null}
            <div className="sm:col-span-2">
              <dt className="text-xs text-slate-500">Ghi chú</dt>
              <dd className="break-words text-slate-900 dark:text-white">{occupant.note ?? '—'}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-3 font-semibold">Hình ảnh</h2>
          {currentSrc ? (
            <div className="flex justify-center bg-slate-50 dark:bg-slate-800/50">
              {isPdf ? (
                <iframe
                  src={currentSrc}
                  title={DOC_LABELS[selectedDoc]}
                  className="h-[28rem] w-full max-w-2xl rounded-lg border-0"
                />
              ) : (
                <img
                  src={currentSrc}
                  alt={DOC_LABELS[selectedDoc]}
                  className="max-h-96 rounded-lg object-contain shadow-md"
                />
              )}
            </div>
          ) : (
            <p className="rounded-lg bg-slate-100 py-12 text-center text-sm text-slate-500 dark:bg-slate-700/50 dark:text-slate-400">
              Chưa có tài liệu
            </p>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-3 font-semibold">Tài liệu</h2>
          <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
            Chọn một mục để hiển thị trong ô Hình ảnh phía trên (chỉ tải khi bấm).
          </p>
          <div className="flex flex-wrap gap-2">
            {(['avatarUrl', 'idFrontUrl', 'idBackUrl', 'tempResidenceUrl'] as const).map((key) => {
              const hasDoc = !!occupant[key]
              const isSelected = selectedDoc === key
              return hasDoc ? (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDoc(key)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    isSelected
                      ? 'border-slate-800 bg-slate-800 text-white dark:border-slate-500 dark:bg-slate-600'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {DOC_LABELS[key]}
                </button>
              ) : (
                <span
                  key={key}
                  className="rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm text-slate-400 dark:border-slate-600"
                >
                  Chưa có {DOC_LABELS[key].toLowerCase()}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link
          to={`/properties/${propId}/rooms/${rId}/occupants`}
          className="inline-block rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
        >
          Quay lại
        </Link>
      </div>
    </div>
  )
}
