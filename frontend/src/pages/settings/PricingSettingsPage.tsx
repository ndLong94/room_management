import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePricing, useUpdatePricing } from '@/hooks/usePricing'

const schema = z.object({
  elecPrice: z.coerce.number().min(0, 'Phải ≥ 0'),
  waterPrice: z.coerce.number().min(0, 'Phải ≥ 0'),
  currency: z.string().max(10).optional(),
})

type FormValues = z.infer<typeof schema>

export function PricingSettingsPage() {
  const { data: pricing, isLoading, error } = usePricing()
  const updatePricing = useUpdatePricing()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { elecPrice: 0, waterPrice: 0, currency: 'VND' },
  })

  useEffect(() => {
    if (pricing) {
      const elec = typeof pricing.elecPrice === 'string' ? parseFloat(pricing.elecPrice) : Number(pricing.elecPrice)
      const water = typeof pricing.waterPrice === 'string' ? parseFloat(pricing.waterPrice) : Number(pricing.waterPrice)
      reset({ elecPrice: Number.isNaN(elec) ? 0 : elec, waterPrice: Number.isNaN(water) ? 0 : water, currency: pricing.currency ?? 'VND' })
    }
  }, [pricing, reset])

  const onSubmit = (values: FormValues) => {
    updatePricing.mutate(
      {
        elecPrice: values.elecPrice,
        waterPrice: values.waterPrice,
        currency: values.currency,
      },
      { onSuccess: () => {} }
    )
  }

  if (isLoading) return <p className="text-slate-500">Đang tải…</p>
  if (error) return <p className="text-red-600">Không tải được cài đặt đơn giá.</p>

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Đơn giá</h1>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        Đơn giá dùng để tính hóa đơn: tiền điện = (chênh lệch chỉ số) × đơn giá điện, tiền nước = (chênh lệch chỉ số) × đơn giá nước.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
        <div>
          <label htmlFor="elecPrice" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Đơn giá điện (mỗi đơn vị)
          </label>
          <input
            id="elecPrice"
            type="number"
            step="0.0001"
            min="0"
            {...register('elecPrice')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
          {errors.elecPrice && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.elecPrice.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="waterPrice" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Đơn giá nước (mỗi đơn vị)
          </label>
          <input
            id="waterPrice"
            type="number"
            step="0.0001"
            min="0"
            {...register('waterPrice')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
          {errors.waterPrice && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.waterPrice.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="currency" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Đơn vị tiền tệ
          </label>
          <input
            id="currency"
            {...register('currency')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-slate-800 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-600 dark:hover:bg-slate-500"
        >
          {isSubmitting ? 'Đang lưu…' : 'Lưu'}
        </button>
      </form>
    </div>
  )
}
