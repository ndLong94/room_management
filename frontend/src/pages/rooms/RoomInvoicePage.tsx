import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useProperty } from '@/hooks/useProperties'
import { useRoom } from '@/hooks/useRooms'
import { useInvoices, useGenerateInvoice, useMarkInvoicePaid, useMarkInvoiceUnpaid, useDeleteInvoice } from '@/hooks/useInvoices'
import { createMeterReading, getMeterReading } from '@/api/meterReadings'
import { formatAmount, formatDate, isDueDateReached } from '@/utils'

function prevMonthYear(month: number, year: number) {
  if (month === 1) return { month: 12, year: year - 1 }
  return { month: month - 1, year }
}

function isFutureMonth(month: number, year: number): boolean {
  const now = new Date()
  const nowYear = now.getFullYear()
  const nowMonth = now.getMonth() + 1
  return year > nowYear || (year === nowYear && month > nowMonth)
}

export function RoomInvoicePage() {
  const { propertyId, roomId } = useParams<{ propertyId: string; roomId: string }>()
  const location = useLocation()
  const fromInvoices = (location.state as { from?: string } | null)?.from === 'invoices'
  const propId = propertyId ? parseInt(propertyId, 10) : null
  const rId = roomId ? parseInt(roomId, 10) : null
  const [meterMonth, setMeterMonth] = useState(new Date().getMonth() + 1)
  const [meterYear, setMeterYear] = useState(new Date().getFullYear())
  const [elecReading, setElecReading] = useState('')
  const [waterReading, setWaterReading] = useState('')

  const { data: property } = useProperty(propId)
  const { data: room } = useRoom(propId, rId)
  const { data: invoicesForMonth } = useInvoices({
    month: meterMonth,
    year: meterYear,
    propertyId: propId ?? undefined,
  })
  const roomInvoice = invoicesForMonth?.find((inv) => inv.roomId === rId) ?? null
  const isFuture = isFutureMonth(meterMonth, meterYear)
  const roomNotOccupied = room?.status !== 'OCCUPIED'
  const meterFormLocked = roomInvoice?.status === 'PAID'
  const meterFutureLocked = isFuture
  const meterSaveDisabled = meterFormLocked || meterFutureLocked || roomNotOccupied
  const canCreateInvoice = !roomNotOccupied

  const fixedElec = room?.fixedElecAmount != null ? Number(room.fixedElecAmount) : null
  const fixedWater = room?.fixedWaterAmount != null ? Number(room.fixedWaterAmount) : null
  const useFixedUtility = fixedElec != null && fixedWater != null && !Number.isNaN(fixedElec) && !Number.isNaN(fixedWater)

  const prev = prevMonthYear(meterMonth, meterYear)
  const { data: prevReading } = useQuery({
    queryKey: ['meter-reading', propId, rId, prev.month, prev.year],
    queryFn: () => getMeterReading(propId!, rId!, prev.month, prev.year),
    enabled: propId != null && rId != null,
  })
  const { data: currentReading } = useQuery({
    queryKey: ['meter-reading', propId, rId, meterMonth, meterYear],
    queryFn: () => getMeterReading(propId!, rId!, meterMonth, meterYear),
    enabled: propId != null && rId != null,
  })

  useEffect(() => {
    if (currentReading && elecReading === '' && waterReading === '') {
      setElecReading(String(currentReading.elecReading))
      setWaterReading(String(currentReading.waterReading))
    }
  }, [currentReading, meterMonth, meterYear])

  const queryClient = useQueryClient()
  const generateInvoice = useGenerateInvoice()
  const markPaid = useMarkInvoicePaid()
  const markUnpaid = useMarkInvoiceUnpaid()
  const deleteInvoice = useDeleteInvoice()

  const initialElec = room?.initialElecReading != null ? Number(room.initialElecReading) : 0
  const initialWater = room?.initialWaterReading != null ? Number(room.initialWaterReading) : 0
  const prevElecVal = prevReading?.elecReading
  const prevWaterVal = prevReading?.waterReading
  const prevElec = prevElecVal != null && String(prevElecVal).trim() !== '' ? Number(prevElecVal) : initialElec
  const prevWater = prevWaterVal != null && String(prevWaterVal).trim() !== '' ? Number(prevWaterVal) : initialWater
  const minElec = Math.max(prevElec, initialElec)
  const minWater = Math.max(prevWater, initialWater)
  const currElec = parseFloat(elecReading) || 0
  const currWater = parseFloat(waterReading) || 0
  const usageElec = Math.max(0, currElec - prevElec)
  const usageWater = Math.max(0, currWater - prevWater)
  const elecPrice = property?.elecPrice != null ? Number(property.elecPrice) : 0
  const waterPrice = property?.waterPrice != null ? Number(property.waterPrice) : 0
  const costElec = Math.round(usageElec * elecPrice)
  const costWater = Math.round(usageWater * waterPrice)

  const handleGenerate = async () => {
    if (propId == null || rId == null) return
    if (useFixedUtility) {
      generateInvoice.mutate(
        { propertyId: propId, roomId: rId, month: meterMonth, year: meterYear },
        {
          onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
          onError: (err: { response?: { status?: number; data?: { message?: string } } }) => {
            if (err?.response?.status === 409) {
              window.alert(err?.response?.data?.message ?? 'Hóa đơn đã thanh toán, không thể chỉnh sửa.')
            }
          },
        }
      )
      return
    }
    const hasSavedMeter = currentReading != null
    const hasFormMeter = elecReading.trim() !== '' && waterReading.trim() !== ''
    if (!hasSavedMeter && !hasFormMeter) {
      window.alert(
        'Chưa có chỉ số điện nước cho tháng này. Vui lòng nhập chỉ số điện và nước ở form "Chỉ số điện nước" phía trên (có thể nhập xong bấm Tạo hóa đơn, hệ thống sẽ tự lưu chỉ số).'
      )
      return
    }
    const formCurrElec = parseFloat(elecReading) || 0
    const formCurrWater = parseFloat(waterReading) || 0
    if (hasFormMeter && (formCurrElec < minElec || formCurrWater < minWater)) {
      window.alert('Chỉ số điện nước nhỏ hơn chỉ số lúc chuyển trạng thái hoặc chỉ số tháng trước. Vui lòng kiểm tra lại.')
      return
    }
    // Khi tạo hóa đơn (không fixed): luôn lưu chỉ số tháng đó nếu form có nhập (create/update)
    if (hasFormMeter) {
      try {
        await createMeterReading(propId, rId, {
          month: meterMonth,
          year: meterYear,
          elecReading: formCurrElec,
          waterReading: formCurrWater,
        })
        queryClient.invalidateQueries({ queryKey: ['meter-reading'] })
      } catch (err: unknown) {
        const msg = err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data ? String((err.response.data as { message: unknown }).message) : null
        toast.error(msg ?? 'Không lưu được chỉ số điện nước.')
        return
      }
    }
    generateInvoice.mutate(
      { propertyId: propId, roomId: rId, month: meterMonth, year: meterYear },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['invoices'] })
        },
        onError: (err: { response?: { status?: number; data?: { message?: string } } }) => {
          if (err?.response?.status === 409) {
            window.alert(err?.response?.data?.message ?? 'Hóa đơn đã thanh toán, không thể chỉnh sửa.')
          }
        },
      }
    )
  }

  if (propId == null || rId == null) return <p className="text-red-600">Bất động sản hoặc phòng không hợp lệ.</p>
  if (!property) return <p className="text-slate-500">Đang tải…</p>
  if (!room) return <p className="text-red-600">Không tìm thấy phòng.</p>

  return (
    <div className="min-w-0">
      {fromInvoices ? (
        <Link
          to="/invoices"
          className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          ← Hóa đơn
        </Link>
      ) : (
        <Link
          to={`/properties/${propId}/rooms`}
          className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          ← Phòng: {property.name}
        </Link>
      )}
      <h1 className="mt-2 mb-4 break-words text-xl font-bold sm:mb-6 sm:text-2xl">
        Hóa đơn & chỉ số: {room.name}
      </h1>

      {roomNotOccupied && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          Phòng chưa cho thuê. Chỉ có thể nhập chỉ số và tạo hóa đơn khi phòng đang cho thuê. Vui lòng sửa phòng để đổi trạng thái sang Đã cho thuê.
        </div>
      )}

      {useFixedUtility && (
        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800/50">
          <p className="font-medium text-slate-700 dark:text-slate-200">Phòng dùng giá điện nước cố định</p>
          <p className="mt-1 text-slate-600 dark:text-slate-300">
            Điện: <strong>{formatAmount(fixedElec!)}</strong>/tháng — Nước: <strong>{formatAmount(fixedWater!)}</strong>/tháng. Các khoản này được cộng vào hóa đơn.
          </p>
        </div>
      )}

      <div className="mb-6 max-w-md space-y-4 rounded-lg border border-slate-200 p-4 sm:mb-8 dark:border-slate-700">
        <h2 className="font-semibold">{useFixedUtility ? 'Tháng hóa đơn' : 'Chỉ số điện nước'}</h2>
        {useFixedUtility ? (
          <p className="text-sm text-slate-500">
            Phòng này dùng giá cố định, không cần nhập chỉ số đồng hồ. Chọn tháng/năm rồi bấm Tạo hóa đơn.
          </p>
        ) : (
          <p className="text-sm text-slate-500">
            Chọn tháng/năm cần nhập, xem chỉ số tháng trước rồi nhập chỉ số hiện tại. Hệ thống tự tính tiêu thụ và dự tính tiền.
          </p>
        )}
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
            <div className="min-w-0 flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-500">Tháng</label>
              <select
                value={meterMonth}
                onChange={(e) => {
                  setMeterMonth(Number(e.target.value))
                  setElecReading('')
                  setWaterReading('')
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0 flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-500">Năm</label>
              <select
                value={meterYear}
                onChange={(e) => {
                  setMeterYear(Number(e.target.value))
                  setElecReading('')
                  setWaterReading('')
                }}
                className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {!useFixedUtility && (
            <>
          <div className="min-w-0 rounded-lg bg-slate-50 p-3 dark:bg-slate-700/50">
            <p className="mb-1 text-xs font-medium text-slate-500">
              {prevReading ? `Chỉ số tháng trước (Tháng ${prev.month}/${prev.year})` : 'Chỉ số khởi điểm / tháng trước'}
            </p>
            {prevReading ? (
              <p className="break-words text-sm text-slate-700 dark:text-slate-300">
                Điện: <strong>{Number(prevReading.elecReading).toLocaleString()}</strong> kWh — Nước:{' '}
                <strong>{Number(prevReading.waterReading).toLocaleString()}</strong> m³
              </p>
            ) : initialElec > 0 || initialWater > 0 ? (
              <p className="break-words text-sm text-slate-700 dark:text-slate-300">
                Điện: <strong>{initialElec.toLocaleString()}</strong> kWh — Nước: <strong>{initialWater.toLocaleString()}</strong> m³
                <span className="ml-1 text-slate-500">(chỉ số khởi điểm phòng)</span>
              </p>
            ) : (
              <p className="text-sm text-slate-500">Chưa có chỉ số tháng trước (sẽ tính từ 0).</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Chỉ số tháng này (Tháng {meterMonth}/{meterYear}) — Điện (kWh)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={elecReading}
              onChange={(e) => setElecReading(e.target.value)}
              placeholder="Nhập chỉ số điện hiện tại"
              disabled={meterSaveDisabled}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Chỉ số tháng này (Tháng {meterMonth}/{meterYear}) — Nước (m³)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={waterReading}
              onChange={(e) => setWaterReading(e.target.value)}
              placeholder="Nhập chỉ số nước hiện tại"
              disabled={meterSaveDisabled}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>

          {(elecReading !== '' || waterReading !== '') && (currElec > 0 || currWater > 0) && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
              <p className="mb-2 text-xs font-medium text-emerald-800 dark:text-emerald-300">Tiêu thụ (tự tính)</p>
              <p className="text-sm text-emerald-900 dark:text-emerald-200">
                Điện: <strong>{usageElec.toLocaleString()}</strong> kWh
                {elecPrice > 0 && (
                  <span className="text-emerald-700 dark:text-emerald-400">
                    {' '}→ {costElec.toLocaleString()} VND
                  </span>
                )}
              </p>
              <p className="text-sm text-emerald-900 dark:text-emerald-200">
                Nước: <strong>{usageWater.toLocaleString()}</strong> m³
                {waterPrice > 0 && (
                  <span className="text-emerald-700 dark:text-emerald-400">
                    {' '}→ {costWater.toLocaleString()} VND
                  </span>
                )}
              </p>
              {(elecPrice > 0 || waterPrice > 0) && (
                <p className="mt-1 text-sm font-medium text-emerald-900 dark:text-emerald-200">
                  Tổng dự tính tiền điện nước: {(costElec + costWater).toLocaleString()} VND
                </p>
              )}
            </div>
          )}

            </>
          )}
        </form>
      </div>

      <div className="max-w-md space-y-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
        <h2 className="font-semibold">Tạo hóa đơn</h2>
        <p className="text-sm text-slate-500">
          {useFixedUtility
            ? `Dùng tháng/năm đã chọn ở form phía trên (Tháng ${meterMonth}/${meterYear}). Bấm Tạo hóa đơn để tạo — tiền điện nước cố định sẽ được cộng tự động.`
            : `Dùng tháng/năm đã chọn ở form phía trên (Tháng ${meterMonth}/${meterYear}). Có thể nhập chỉ số rồi bấm Tạo hóa đơn — hệ thống sẽ tự lưu chỉ số nếu chưa lưu.`}
        </p>

        {roomInvoice && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
            <p className="font-medium text-slate-900 dark:text-white">
              {roomInvoice.dueDate ? formatDate(roomInvoice.dueDate) : `Tháng ${meterMonth}/${meterYear}`}
              {roomInvoice.status === 'UNPAID' && roomInvoice.dueDate && !isDueDateReached(roomInvoice.dueDate) && (
                <span className="ml-1 text-amber-600 dark:text-amber-400">(chưa tới ngày)</span>
              )}
              : {roomInvoice.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Tổng: {formatAmount(roomInvoice.totalAmount)}
            </p>
            {roomInvoice.status === 'PAID' ? (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Không thể tạo hoặc sửa hóa đơn đã thanh toán.
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
              {roomInvoice.status === 'UNPAID' ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (!window.confirm('Đánh dấu hóa đơn này là đã thu tiền?')) return
                      const paidAt = new Date().toISOString()
                      markPaid.mutate(
                        { id: roomInvoice.id, input: { paidAt } },
                        { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }) }
                      )
                    }}
                    disabled={markPaid.isPending}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                  >
                    {markPaid.isPending ? 'Đang cập nhật…' : 'Đánh dấu đã thu'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Xóa hóa đơn chưa thanh toán này?')) {
                        deleteInvoice.mutate(roomInvoice.id, {
                          onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
                        })
                      }
                    }}
                    disabled={deleteInvoice.isPending}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
                  >
                    {deleteInvoice.isPending ? 'Đang xóa…' : 'Xóa hóa đơn'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Đánh dấu hóa đơn này là chưa thanh toán?')) {
                      markUnpaid.mutate(roomInvoice.id, {
                        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
                      })
                    }
                  }}
                  disabled={markUnpaid.isPending}
                  className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 dark:bg-amber-500 dark:hover:bg-amber-600"
                >
                  {markUnpaid.isPending ? 'Đang cập nhật…' : 'Đánh dấu chưa thu'}
                </button>
              )}
            </div>
          </div>
        )}

        {isFuture && (
          <p className="rounded-lg bg-amber-50 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            Không thể tạo hóa đơn cho tháng tương lai.
          </p>
        )}

        {!roomInvoice || roomInvoice.status !== 'PAID' ? (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generateInvoice.isPending || isFuture || !canCreateInvoice}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {generateInvoice.isPending ? 'Đang tạo…' : `Tạo hóa đơn tháng ${meterMonth}/${meterYear}`}
          </button>
        ) : null}
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
