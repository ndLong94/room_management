import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import type { RoomStatus } from '@/types/room'
import { getErrorMessageVi } from '@/utils'
import { useProperty } from '@/hooks/useProperties'
import { useCreateRoom, useRoom, useUpdateRoom } from '@/hooks/useRooms'
import { useOccupants } from '@/hooks/useOccupants'
import { uploadFile } from '@/api/files'
import { createMeterReading } from '@/api/meterReadings'

const schema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên phòng').max(255),
  rentPrice: z.coerce.number().min(0, 'Phải ≥ 0'),
  status: z.enum(['VACANT', 'OCCUPIED']),
})

const STATUS_OPTIONS: { value: 'VACANT' | 'OCCUPIED'; label: string }[] = [
  { value: 'VACANT', label: 'Còn trống' },
  { value: 'OCCUPIED', label: 'Đã cho thuê' },
]

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

type FormValues = z.infer<typeof schema>

type Props = { mode: 'new' | 'edit' }

export function RoomFormPage({ mode }: Props) {
  const { propertyId, roomId } = useParams<{ propertyId: string; roomId?: string }>()
  const propId = propertyId ? parseInt(propertyId, 10) : null
  const rId = roomId ? parseInt(roomId, 10) : null
  const navigate = useNavigate()
  const isEdit = mode === 'edit'
  const [contractUrl, setContractUrl] = useState<string | null>(null)
  const [paymentDay, setPaymentDay] = useState<number | ''>('')
  const [uploadingContract, setUploadingContract] = useState(false)
  const contractInputRef = useRef<HTMLInputElement>(null)

  const [showOccupiedModal, setShowOccupiedModal] = useState(false)
  const [pendingPayload, setPendingPayload] = useState<{
    name: string
    rentPrice: number
    status: RoomStatus
    paymentDay?: number
    depositAmount?: number
    depositDate?: string
    depositPaid?: boolean
    contractUrl?: string
    fixedElecAmount?: number
    fixedWaterAmount?: number
    initialElecReading?: number
    initialWaterReading?: number
  } | null>(null)
  const [depositAmount, setDepositAmount] = useState<string>('')
  const [depositDate, setDepositDate] = useState(() => todayDateString())
  const [depositPaid, setDepositPaid] = useState(false)
  const [meterElec, setMeterElec] = useState('')
  const [meterWater, setMeterWater] = useState('')
  const [fixedElec, setFixedElec] = useState('')
  const [fixedWater, setFixedWater] = useState('')
  const [occupiedSubmitting, setOccupiedSubmitting] = useState(false)

  const { data: property, isLoading: loadingProperty } = useProperty(propId)
  const { data: room, isLoading: loadingRoom } = useRoom(propId, isEdit ? rId : null)
  const { data: occupants } = useOccupants(propId, isEdit ? rId : null)
  const createRoom = useCreateRoom(propId ?? 0)
  const updateRoom = useUpdateRoom(propId ?? 0)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', rentPrice: 0, status: 'VACANT' },
  })

  useEffect(() => {
    if (isEdit && room) {
      reset({ name: room.name, rentPrice: room.rentPrice ?? 0, status: room.status })
      setContractUrl(room.contractUrl ?? null)
      setPaymentDay(room.paymentDay ?? '')
      setDepositAmount(room.depositAmount != null ? String(room.depositAmount) : '')
      setDepositDate(room.depositDate ?? todayDateString())
      setDepositPaid(room.depositPaid ?? false)
      if (room.rentPrice != null) {
        const rent = typeof room.rentPrice === 'string' ? room.rentPrice : String(room.rentPrice)
        setValue('rentPrice', Number(rent) || 0)
      }
    }
  }, [isEdit, room, reset])

  const handleContractUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploadingContract(true)
    try {
      const { url } = await uploadFile(file)
      setContractUrl(url)
      toast.success('Đã tải hợp đồng lên')
    } catch (err: unknown) {
      toast.error(getErrorMessageVi(err, 'Tải lên thất bại. Kiểm tra file (tối đa 5MB, ảnh hoặc PDF).'))
    } finally {
      setUploadingContract(false)
    }
  }

  if (propId == null) return <p className="text-red-600">Bất động sản không hợp lệ.</p>
  if (loadingProperty) return <p className="text-slate-500">Đang tải…</p>
  if (!property) return <p className="text-red-600">Không tìm thấy bất động sản.</p>
  if (isEdit && rId != null) {
    if (loadingRoom) return <p className="text-slate-500">Đang tải phòng…</p>
    if (!room) return <p className="text-red-600">Không tìm thấy phòng.</p>
  }

  const buildPayload = (values: FormValues, overrides?: { fixedElecAmount?: number; fixedWaterAmount?: number; depositAmount?: number; depositDate?: string; depositPaid?: boolean }) => ({
    name: values.name.trim(),
    rentPrice: values.rentPrice,
    status: values.status as RoomStatus,
    ...(isEdit && { contractUrl: contractUrl ?? undefined }),
    paymentDay: paymentDay === '' ? undefined : paymentDay,
    depositAmount:
      overrides?.depositAmount !== undefined
        ? overrides.depositAmount
        : depositAmount === ''
          ? undefined
          : Number(depositAmount),
    depositDate: overrides?.depositDate !== undefined ? overrides.depositDate : (depositDate.trim() || undefined),
    // Khi edit, luôn gửi depositPaid (kể cả false) để backend có thể update
    depositPaid: overrides?.depositPaid !== undefined ? overrides.depositPaid : (isEdit ? depositPaid : undefined),
    ...overrides,
  })

  const onSubmit = async (values: FormValues) => {
    if (
      isEdit &&
      rId != null &&
      room &&
      values.status === 'VACANT' &&
      room.status === 'OCCUPIED' &&
      (occupants?.length ?? 0) > 0
    ) {
      const ok = window.confirm(
        `Phòng đang có ${occupants!.length} người ở. Chuyển sang Còn trống sẽ lưu lịch sử và xóa danh sách người ở hiện tại. Bạn có chắc muốn thực hiện?`
      )
      if (!ok) return
    }
    const needOccupiedModal =
      values.status === 'OCCUPIED' && (!isEdit || room?.status === 'VACANT')
    if (needOccupiedModal) {
      const defaultPaymentDay = paymentDay === '' ? new Date().getDate() : paymentDay
      setPaymentDay(defaultPaymentDay)
      setPendingPayload({
        ...buildPayload(values),
        paymentDay: defaultPaymentDay,
        // Khi chuyển sang OCCUPIED, nếu không có depositAmount thì depositPaid = false
        depositAmount: depositAmount === '' ? undefined : Number(depositAmount),
        depositDate: depositDate.trim() || undefined,
        depositPaid: depositAmount === '' ? false : depositPaid,
      })
      setShowOccupiedModal(true)
      setMeterElec('')
      setMeterWater('')
      setFixedElec('')
      setFixedWater('')
      return
    }
    const payload = buildPayload(values)
    if (isEdit && rId != null) {
      updateRoom.mutate(
        { roomId: rId, input: payload },
        { onSuccess: () => navigate(`/properties/${propId}/rooms`) }
      )
    } else {
      createRoom.mutate(payload, { onSuccess: () => navigate(`/properties/${propId}/rooms`) })
    }
  }

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const confirmOccupiedWithMeter = async () => {
    if (!pendingPayload || propId == null) return
    const elec = parseFloat(meterElec)
    const water = parseFloat(meterWater)
    if (Number.isNaN(elec) || Number.isNaN(water) || elec < 0 || water < 0) {
      toast.error('Vui lòng nhập chỉ số điện và nước hợp lệ (số ≥ 0).')
      return
    }
    const payloadWithInitial = {
      ...pendingPayload,
      initialElecReading: elec,
      initialWaterReading: water,
    }
    setOccupiedSubmitting(true)
    try {
      if (isEdit && rId != null) {
        await updateRoom.mutateAsync({ roomId: rId, input: payloadWithInitial })
        await createMeterReading(propId, rId, {
          month: currentMonth,
          year: currentYear,
          elecReading: elec,
          waterReading: water,
        })
        toast.success('Đã cập nhật phòng và lưu chỉ số điện nước.')
        setShowOccupiedModal(false)
        setPendingPayload(null)
        navigate(`/properties/${propId}/rooms`)
      } else {
        const created = await createRoom.mutateAsync(payloadWithInitial)
        await createMeterReading(propId, created.id, {
          month: currentMonth,
          year: currentYear,
          elecReading: elec,
          waterReading: water,
        })
        toast.success('Đã tạo phòng và lưu chỉ số điện nước.')
        setShowOccupiedModal(false)
        setPendingPayload(null)
        navigate(`/properties/${propId}/rooms`)
      }
    } catch {
      toast.error('Không thể lưu. Thử lại.')
    } finally {
      setOccupiedSubmitting(false)
    }
  }

  const confirmOccupiedWithFixed = async () => {
    if (!pendingPayload || propId == null) return
    const elec = parseFloat(fixedElec)
    const water = parseFloat(fixedWater)
    if (Number.isNaN(elec) || Number.isNaN(water) || elec < 0 || water < 0) {
      toast.error('Vui lòng nhập giá điện và nước hợp lệ (số ≥ 0, đơn vị đ/tháng).')
      return
    }
    const payloadWithFixed = {
      ...pendingPayload,
      fixedElecAmount: elec,
      fixedWaterAmount: water,
    }
    setOccupiedSubmitting(true)
    try {
      if (isEdit && rId != null) {
        await updateRoom.mutateAsync({ roomId: rId, input: payloadWithFixed })
        toast.success('Đã cập nhật phòng với giá điện nước cố định.')
      } else {
        await createRoom.mutateAsync(payloadWithFixed)
        toast.success('Đã tạo phòng với giá điện nước cố định.')
      }
      setShowOccupiedModal(false)
      setPendingPayload(null)
      navigate(`/properties/${propId}/rooms`)
    } catch {
      toast.error('Không thể lưu. Thử lại.')
    } finally {
      setOccupiedSubmitting(false)
    }
  }

  return (
    <div>
      <Link
        to={`/properties/${propId}/rooms`}
        className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        ← Phòng: {property.name}
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold">{isEdit ? 'Sửa phòng' : 'Thêm phòng'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Tên phòng *
          </label>
          <input
            id="name"
            {...register('name')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="rentPrice" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Tiền thuê
          </label>
          <input
            id="rentPrice"
            type="text"
            inputMode="numeric"
            pattern="[0-9,]*"
            onChange={(e) => {
              const digits = e.target.value.replace(/[^\d]/g, '')
              const display = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              // hiển thị lại trong input
              ;(e.target as HTMLInputElement).value = display
              const n = digits === '' ? 0 : Number(digits)
              setValue('rentPrice', n, { shouldValidate: true })
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
          <input type="hidden" {...register('rentPrice')} />
          {errors.rentPrice && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.rentPrice.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Trạng thái *
          </label>
          <select
            id="status"
            {...register('status')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="paymentDay" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Ngày thanh toán (1–31)
          </label>
          <select
            id="paymentDay"
            value={paymentDay === '' ? '' : paymentDay}
            onChange={(e) => setPaymentDay(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            <option value="">Không đặt (Mặc định là ngày 1 hàng tháng)</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>Ngày {d}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Hóa đơn tự động tạo lúc 6h sáng vào ngày này mỗi tháng (nếu chưa có).
          </p>
        </div>
        <div>
          <label htmlFor="depositAmount" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Tiền đặt cọc (đ)
          </label>
          <input
            id="depositAmount"
            type="text"
            inputMode="numeric"
            pattern="[0-9,]*"
            value={
              depositAmount === ''
                ? ''
                : depositAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }
            onChange={(e) => {
              const digits = e.target.value.replace(/[^\d]/g, '')
              setDepositAmount(digits)
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="depositDate" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Ngày cọc
          </label>
          <input
            id="depositDate"
            type="date"
            value={depositDate}
            onChange={(e) => setDepositDate(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
        </div>
        {isEdit && (
          <div className="flex items-center gap-2">
            <input
              id="depositPaid"
              type="checkbox"
              checked={depositPaid}
              onChange={(e) => setDepositPaid(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-700"
            />
            <label htmlFor="depositPaid" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Đã cọc
            </label>
          </div>
        )}
        {isEdit && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Hợp đồng nhà
            </label>
            <input
              ref={contractInputRef}
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              className="hidden"
              onChange={handleContractUpload}
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => contractInputRef.current?.click()}
                disabled={uploadingContract}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700"
              >
                {uploadingContract ? 'Đang tải…' : 'Tải hợp đồng lên'}
              </button>
              {contractUrl ? (
                <a
                  href={contractUrl.startsWith('http') ? contractUrl : `${import.meta.env.VITE_API_URL ?? ''}${contractUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-sky-600 dark:text-sky-400"
                >
                  Xem hợp đồng
                </a>
              ) : null}
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isSubmitting ? 'Đang lưu…' : isEdit ? 'Cập nhật' : 'Tạo'}
          </button>
          <Link
            to={`/properties/${propId}/rooms`}
            className="rounded-lg bg-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            Quay lại
          </Link>
        </div>
      </form>

      {/* Modal: khi chuyển sang Đã cho thuê — nhập điện nước */}
      {showOccupiedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-2 text-lg font-semibold">Chuyển sang Đã cho thuê</h2>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              Cần nhập thông tin điện nước hiện tại của phòng. Chọn một trong hai cách:
            </p>

            <div className="space-y-6">
              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-600">
                <h3 className="mb-2 font-medium">1. Nhập chỉ số đồng hồ điện nước hiện tại</h3>
                <p className="mb-3 text-xs text-slate-500">Ghi lại chỉ số điện và nước trên đồng hồ tại thời điểm cho thuê.</p>
                <div className="mb-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Chỉ số điện</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={meterElec}
                      onChange={(e) => setMeterElec(e.target.value)}
                      placeholder="0"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Chỉ số nước</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={meterWater}
                      onChange={(e) => setMeterWater(e.target.value)}
                      placeholder="0"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={confirmOccupiedWithMeter}
                  disabled={occupiedSubmitting}
                  className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-white hover:bg-slate-600 disabled:opacity-50"
                >
                  {occupiedSubmitting ? 'Đang xử lý…' : 'Xác nhận — dùng chỉ số đồng hồ'}
                </button>
              </div>

              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-600">
                <h3 className="mb-2 font-medium">2. Nhập giá cố định hàng tháng</h3>
                <p className="mb-3 text-xs text-slate-500">Ví dụ: điện 100.000 đ/tháng, nước 50.000 đ/tháng.</p>
                <div className="mb-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Điện (đ/tháng)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9,]*"
                      value={
                        fixedElec === ''
                          ? ''
                          : fixedElec.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }
                      onChange={(e) => {
                        const digits = e.target.value.replace(/[^\d]/g, '')
                        setFixedElec(digits)
                      }}
                      placeholder="100000"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Nước (đ/tháng)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9,]*"
                      value={
                        fixedWater === ''
                          ? ''
                          : fixedWater.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }
                      onChange={(e) => {
                        const digits = e.target.value.replace(/[^\d]/g, '')
                        setFixedWater(digits)
                      }}
                      placeholder="50000"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={confirmOccupiedWithFixed}
                  disabled={occupiedSubmitting}
                  className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-white hover:bg-slate-600 disabled:opacity-50"
                >
                  {occupiedSubmitting ? 'Đang xử lý…' : 'Xác nhận — dùng giá cố định'}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { setShowOccupiedModal(false); setPendingPayload(null) }}
              className="mt-4 w-full rounded-lg border border-slate-300 py-2 text-sm font-medium dark:border-slate-600 dark:text-slate-300"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
