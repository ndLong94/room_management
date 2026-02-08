import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useProperty } from '@/hooks/useProperties'
import { useRoom } from '@/hooks/useRooms'
import { useOccupants, useCreateOccupant, useUpdateOccupant, useDeleteOccupant } from '@/hooks/useOccupants'
import { uploadFile } from '@/api/files'
import type { Occupant } from '@/types/occupant'

type UploadField = 'avatarUrl' | 'idFrontUrl' | 'idBackUrl' | 'tempResidenceUrl'

export function OccupantsPage() {
  const { propertyId, roomId } = useParams<{ propertyId: string; roomId: string }>()
  const propId = propertyId ? parseInt(propertyId, 10) : null
  const rId = roomId ? parseInt(roomId, 10) : null
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formIdNumber, setFormIdNumber] = useState('')
  const [formNote, setFormNote] = useState('')
  const [uploading, setUploading] = useState<{ id: number; field: UploadField } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingUploadRef = useRef<{ occupant: Occupant; field: UploadField } | null>(null)

  const { data: property } = useProperty(propId)
  const { data: room } = useRoom(propId, rId)
  const { data: occupants, isLoading, error } = useOccupants(propId, rId)
  const canAddOccupant = room?.status === 'OCCUPIED'
  const createOccupant = useCreateOccupant(propId ?? 0, rId ?? 0)
  const updateOccupant = useUpdateOccupant(propId ?? 0, rId ?? 0)
  const deleteOccupant = useDeleteOccupant(propId ?? 0, rId ?? 0)

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Xóa người ở "${name}"?`)) deleteOccupant.mutate(id)
  }

  const handleEdit = (o: Occupant) => {
    setEditingId(o.id)
    setFormName(o.fullName)
    setFormPhone(o.phone ?? '')
    setFormIdNumber(o.idNumber ?? '')
    setFormNote(o.note ?? '')
  }

  const handleSaveEdit = () => {
    if (editingId == null) return
    updateOccupant.mutate(
      {
        id: editingId,
        input: {
          fullName: formName.trim(),
          phone: formPhone.trim() || undefined,
          idNumber: formIdNumber.trim() || undefined,
          note: formNote.trim() || undefined,
        },
      },
      { onSuccess: () => setEditingId(null) }
    )
  }

  const handleAdd = () => {
    if (!formName.trim()) return
    createOccupant.mutate(
      {
        fullName: formName.trim(),
        phone: formPhone.trim() || undefined,
        idNumber: formIdNumber.trim() || undefined,
        note: formNote.trim() || undefined,
      },
      {
        onSuccess: () => {
          setShowForm(false)
          setFormName('')
          setFormPhone('')
          setFormIdNumber('')
          setFormNote('')
        },
      }
    )
  }

  const triggerUpload = (occupant: Occupant, field: UploadField) => {
    pendingUploadRef.current = { occupant, field }
    setUploading({ id: occupant.id, field })
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    const pending = pendingUploadRef.current
    if (!file || !pending) {
      setUploading(null)
      return
    }
    try {
      const { url } = await uploadFile(file)
      const { occupant, field } = pending
      updateOccupant.mutate(
        {
          id: occupant.id,
          input: {
            fullName: occupant.fullName,
            phone: occupant.phone ?? undefined,
            idNumber: occupant.idNumber ?? undefined,
            idType: occupant.idType ?? undefined,
            address: occupant.address ?? undefined,
            dob: occupant.dob ?? undefined,
            avatarUrl: field === 'avatarUrl' ? url : occupant.avatarUrl ?? undefined,
            idFrontUrl: field === 'idFrontUrl' ? url : occupant.idFrontUrl ?? undefined,
            idBackUrl: field === 'idBackUrl' ? url : occupant.idBackUrl ?? undefined,
            tempResidenceUrl: field === 'tempResidenceUrl' ? url : occupant.tempResidenceUrl ?? undefined,
            note: occupant.note ?? undefined,
          },
        },
        {
          onSuccess: () => {
            toast.success('Đã tải lên')
            setUploading(null)
          },
          onError: () => {
            toast.error('Tải lên thất bại. Thử lại.')
            setUploading(null)
          },
        }
      )
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response
          ? (err.response.data as { message?: string })?.message
          : null
      toast.error(msg || 'Tải lên thất bại. Kiểm tra file (tối đa 5MB, ảnh hoặc PDF).')
      setUploading(null)
    } finally {
      setUploading(null)
      pendingUploadRef.current = null
    }
  }

  if (propId == null || rId == null) return <p className="text-red-600">Đường dẫn không hợp lệ.</p>
  if (!property) return <p className="text-slate-500">Đang tải…</p>
  if (isLoading) return <p className="text-slate-500">Đang tải…</p>
  if (error) return <p className="text-red-600">Không tải được danh sách người ở.</p>

  const uploadLabels: Record<UploadField, string> = {
    avatarUrl: 'Hình cá nhân',
    idFrontUrl: 'CCCD mặt trước',
    idBackUrl: 'CCCD mặt sau',
    tempResidenceUrl: 'Tạm trú tạm vắng',
  }

  return (
    <div className="min-w-0">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <Link
        to={`/properties/${propId}/rooms`}
        className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        ← Phòng: {property.name}
      </Link>
      <div className="mt-2 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="break-words text-xl font-bold sm:text-2xl">Người ở (Phòng: {property.name})</h1>
        <Link
          to={`/properties/${propId}/rooms/${rId}/history`}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Lịch sử cho thuê
        </Link>
      </div>

      {canAddOccupant && !showForm && !editingId && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mb-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500"
        >
          Thêm người ở
        </button>
      )}
      {room?.status === 'VACANT' && (
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Chỉ thêm người ở khi phòng ở trạng thái Đã cho thuê. Vui lòng sửa phòng để đổi trạng thái.
        </p>
      )}

      {showForm && (
        <div className="mb-6 min-w-0 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <h2 className="mb-3 font-semibold">Thêm người ở</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="min-w-0">
              <label className="mb-1 block text-xs font-medium text-slate-500">Họ tên *</label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div className="min-w-0">
              <label className="mb-1 block text-xs font-medium text-slate-500">SĐT</label>
              <input
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div className="min-w-0 sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-500">Số CMND/CCCD</label>
              <input
                value={formIdNumber}
                onChange={(e) => setFormIdNumber(e.target.value)}
                className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div className="min-w-0 sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-500">Ghi chú</label>
              <input
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
                className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!formName.trim() || createOccupant.isPending}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-600"
            >
              {createOccupant.isPending ? 'Đang lưu…' : 'Thêm'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:hover:bg-slate-700"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Mobile: card list */}
      <div className="space-y-3 md:hidden">
        {!occupants?.length ? (
          <p className="rounded-lg border border-slate-200 bg-white py-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">
            Chưa có người ở. Thêm mới để quản lý.
          </p>
        ) : (
          occupants.map((o) => (
            <div
              key={o.id}
              className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50"
            >
              {editingId === o.id ? (
                <div className="space-y-3">
                  <input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Họ tên"
                    className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                  <input
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="SĐT"
                    className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                  <input
                    value={formIdNumber}
                    onChange={(e) => setFormIdNumber(e.target.value)}
                    placeholder="CMND/CCCD"
                    className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                  <input
                    value={formNote}
                    onChange={(e) => setFormNote(e.target.value)}
                    placeholder="Ghi chú"
                    className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={!formName.trim() || updateOccupant.isPending}
                      className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-white dark:bg-slate-600"
                    >
                      Lưu
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="truncate font-medium text-slate-900 dark:text-white">{o.fullName}</p>
                  <p className="truncate text-sm text-slate-600 dark:text-slate-300">{o.phone ?? '—'}</p>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">{o.idNumber ?? '—'}</p>
                  {o.note ? (
                    <p className="line-clamp-2 break-words text-sm text-slate-500 dark:text-slate-400" title={o.note}>
                      Ghi chú: {o.note}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(['avatarUrl', 'idFrontUrl', 'idBackUrl', 'tempResidenceUrl'] as const).map((field) => {
                      const url = o[field]
                      const isUploading = uploading?.id === o.id && uploading?.field === field
                      return (
                        <span key={field} className="inline-flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => triggerUpload(o, field)}
                            disabled={isUploading}
                            className="rounded bg-slate-200 px-1.5 py-0.5 text-xs hover:bg-slate-300 disabled:opacity-50 dark:bg-slate-600 dark:hover:bg-slate-500"
                          >
                            {isUploading ? '…' : uploadLabels[field]}
                          </button>
                          {url ? (
                            <a
                              href={url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL ?? ''}${url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-sky-600 dark:text-sky-400"
                            >
                              ✓
                            </a>
                          ) : null}
                        </span>
                      )
                    })}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
                    <Link
                      to={`/properties/${propId}/rooms/${rId}/occupants/${o.id}`}
                      className="text-sm text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                    >
                      Xem
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleEdit(o)}
                      className="text-sm text-slate-600 dark:text-slate-400"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(o.id, o.fullName)}
                      className="text-sm text-red-600 dark:text-red-400"
                    >
                      Xóa
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden min-w-0 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 md:block">
        <table className="min-w-full table-fixed divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="w-[16%] px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Họ tên
              </th>
              <th className="w-[10%] px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                SĐT
              </th>
              <th className="w-[12%] px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                CMND/CCCD
              </th>
              <th className="min-w-0 w-[18%] px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Ghi chú
              </th>
              <th className="min-w-0 w-[24%] px-4 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Tài liệu (tải lên)
              </th>
              <th className="w-[20%] shrink-0 px-4 py-3 text-right text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-800/50">
            {!occupants?.length ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Chưa có người ở. Thêm mới để quản lý.
                </td>
              </tr>
            ) : (
              occupants.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  {editingId === o.id ? (
                    <>
                      <td className="min-w-0 px-4 py-3">
                        <input
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="w-full min-w-0 rounded border px-2 py-1 dark:bg-slate-700 dark:text-white"
                        />
                      </td>
                      <td className="min-w-0 px-4 py-3">
                        <input
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          className="w-full min-w-0 rounded border px-2 py-1 dark:bg-slate-700 dark:text-white"
                        />
                      </td>
                      <td className="min-w-0 px-4 py-3">
                        <input
                          value={formIdNumber}
                          onChange={(e) => setFormIdNumber(e.target.value)}
                          className="w-full min-w-0 rounded border px-2 py-1 dark:bg-slate-700 dark:text-white"
                        />
                      </td>
                      <td className="min-w-0 px-4 py-3">
                        <input
                          value={formNote}
                          onChange={(e) => setFormNote(e.target.value)}
                          placeholder="Ghi chú"
                          className="w-full min-w-0 rounded border px-2 py-1 dark:bg-slate-700 dark:text-white"
                        />
                      </td>
                      <td className="min-w-0 px-4 py-3" />
                      <td className="shrink-0 px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          disabled={!formName.trim() || updateOccupant.isPending}
                          className="mr-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        >
                          Lưu
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        >
                          Hủy
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="min-w-0 truncate px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {o.fullName}
                      </td>
                      <td className="min-w-0 truncate px-4 py-3 text-slate-600 dark:text-slate-300">
                        {o.phone ?? '—'}
                      </td>
                      <td className="min-w-0 truncate px-4 py-3 text-slate-600 dark:text-slate-300">
                        {o.idNumber ?? '—'}
                      </td>
                      <td className="min-w-0 max-w-[12rem] px-4 py-3">
                        <span className="line-clamp-2 block truncate text-slate-600 dark:text-slate-300" title={o.note ?? undefined}>
                          {o.note ?? '—'}
                        </span>
                      </td>
                      <td className="min-w-0 px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(['avatarUrl', 'idFrontUrl', 'idBackUrl', 'tempResidenceUrl'] as const).map((field) => {
                            const url = o[field]
                            const isUploading = uploading?.id === o.id && uploading?.field === field
                            return (
                              <span key={field} className="inline-flex items-center gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => triggerUpload(o, field)}
                                  disabled={isUploading}
                                  className="rounded bg-slate-200 px-1.5 py-0.5 text-xs hover:bg-slate-300 disabled:opacity-50 dark:bg-slate-600 dark:hover:bg-slate-500"
                                >
                                  {isUploading ? '…' : uploadLabels[field]}
                                </button>
                                {url ? (
                                  <a
                                    href={url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL ?? ''}${url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="truncate text-xs text-sky-600 dark:text-sky-400"
                                    title="Xem"
                                  >
                                    ✓
                                  </a>
                                ) : null}
                              </span>
                            )
                          })}
                        </div>
                      </td>
                      <td className="shrink-0 px-4 py-3 text-right">
                        <Link
                          to={`/properties/${propId}/rooms/${rId}/occupants/${o.id}`}
                          className="mr-2 text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300"
                        >
                          Xem
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleEdit(o)}
                          className="mr-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(o.id, o.fullName)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400"
                        >
                          Xóa
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
