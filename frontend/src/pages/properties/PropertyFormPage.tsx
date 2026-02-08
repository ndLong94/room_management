import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateProperty, useProperty, useUpdateProperty } from '@/hooks/useProperties'

const schema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên').max(255),
  address: z.string().max(500).optional().or(z.literal('')),
  note: z.string().optional().or(z.literal('')),
  elecPrice: z.preprocess(
    (v) => {
      if (v === '' || v === undefined) return undefined
      const n = Number(v)
      return Number.isNaN(n) ? undefined : n
    },
    z.number().min(0, 'Phải ≥ 0').optional()
  ),
  waterPrice: z.preprocess(
    (v) => {
      if (v === '' || v === undefined) return undefined
      const n = Number(v)
      return Number.isNaN(n) ? undefined : n
    },
    z.number().min(0, 'Phải ≥ 0').optional()
  ),
})

type FormValues = z.infer<typeof schema>

type Props = {
  mode: 'new' | 'edit'
}

export function PropertyFormPage({ mode }: Props) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const propertyId = id ? parseInt(id, 10) : null
  const isEdit = mode === 'edit'

  const { data: property, isLoading: loadingProperty } = useProperty(propertyId ?? null)
  const createProperty = useCreateProperty()
  const updateProperty = useUpdateProperty()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', address: '', note: '', elecPrice: undefined, waterPrice: undefined },
  })

  useEffect(() => {
    if (isEdit && property) {
      reset({
        name: property.name,
        address: property.address ?? '',
        note: property.note ?? '',
        elecPrice: property.elecPrice ?? undefined,
        waterPrice: property.waterPrice ?? undefined,
      })
    }
  }, [isEdit, property, reset])

  if (isEdit && propertyId != null) {
    if (loadingProperty) return <p className="text-slate-500">Đang tải…</p>
    if (!property) return <p className="text-red-600">Không tìm thấy bất động sản.</p>
  }

  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name.trim(),
      address: values.address?.trim() || undefined,
      note: values.note || undefined,
      elecPrice: values.elecPrice != null && !Number.isNaN(values.elecPrice) ? values.elecPrice : undefined,
      waterPrice: values.waterPrice != null && !Number.isNaN(values.waterPrice) ? values.waterPrice : undefined,
    }
    if (isEdit && propertyId != null) {
      updateProperty.mutate(
        { id: propertyId, input: payload },
        {
          onSuccess: () => navigate('/properties'),
        }
      )
    } else {
      createProperty.mutate(payload, {
        onSuccess: () => navigate('/properties'),
      })
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{isEdit ? 'Sửa bất động sản' : 'Thêm bất động sản'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Tên *
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
          <label htmlFor="address" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Địa chỉ
          </label>
          <input
            id="address"
            {...register('address')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="note" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Ghi chú
          </label>
          <textarea
            id="note"
            rows={3}
            {...register('note')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
          {errors.note && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.note.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="elecPrice" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Điện (VND/kWh)
          </label>
          <input
            id="elecPrice"
            type="number"
            min="0"
            step="1"
            {...register('elecPrice')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
          {errors.elecPrice && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.elecPrice.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="waterPrice" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Nước (VND/m³)
          </label>
          <input
            id="waterPrice"
            type="number"
            min="0"
            step="1"
            {...register('waterPrice')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
          {errors.waterPrice && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.waterPrice.message}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-slate-800 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-600 dark:hover:bg-slate-500"
          >
            {isSubmitting ? 'Đang lưu…' : isEdit ? 'Cập nhật' : 'Tạo'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/properties')}
            className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  )
}
