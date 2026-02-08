import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import type { RoomStatus } from '@/types/room'
import { useProperty } from '@/hooks/useProperties'
import { useCreateRoom, useRoom, useUpdateRoom } from '@/hooks/useRooms'
import { useOccupants } from '@/hooks/useOccupants'
import { uploadFile } from '@/api/files'

const schema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên phòng').max(255),
  rentPrice: z.coerce.number().min(0, 'Phải ≥ 0'),
  status: z.enum(['VACANT', 'OCCUPIED']),
})

const STATUS_OPTIONS: { value: 'VACANT' | 'OCCUPIED'; label: string }[] = [
  { value: 'VACANT', label: 'Còn trống' },
  { value: 'OCCUPIED', label: 'Đã cho thuê' },
]

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
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', rentPrice: 0, status: 'VACANT' },
  })

  useEffect(() => {
    if (isEdit && room) {
      reset({ name: room.name, rentPrice: room.rentPrice ?? 0, status: room.status })
      setContractUrl(room.contractUrl ?? null)
      setPaymentDay(room.paymentDay ?? '')
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
      const msg =
        err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response
          ? (err.response.data as { message?: string })?.message
          : null
      toast.error(msg || 'Tải lên thất bại. Kiểm tra file (tối đa 5MB, ảnh hoặc PDF).')
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
    const payload = {
      name: values.name.trim(),
      rentPrice: values.rentPrice,
      status: values.status as RoomStatus,
      ...(isEdit && { contractUrl: contractUrl ?? undefined }),
      paymentDay: paymentDay === '' ? undefined : paymentDay,
    }
    if (isEdit && rId != null) {
      updateRoom.mutate(
        { roomId: rId, input: payload },
        { onSuccess: () => navigate(`/properties/${propId}/rooms`) }
      )
    } else {
      createRoom.mutate(payload, { onSuccess: () => navigate(`/properties/${propId}/rooms`) })
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
            type="number"
            step="0.01"
            min="0"
            {...register('rentPrice')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
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
            <option value="">Không đặt (tạo hóa đơn thủ công)</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>Ngày {d}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Hóa đơn tự động tạo lúc 6h sáng vào ngày này mỗi tháng (nếu chưa có).
          </p>
        </div>
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
            className="rounded-lg bg-slate-800 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-600 dark:hover:bg-slate-500"
          >
            {isSubmitting ? 'Đang lưu…' : isEdit ? 'Cập nhật' : 'Tạo'}
          </button>
          <Link
            to={`/properties/${propId}/rooms`}
            className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Hủy
          </Link>
        </div>
      </form>
    </div>
  )
}
