import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { updateProfile } from '@/api/auth'
import { useQueryClient } from '@tanstack/react-query'

const schema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
})

type FormData = z.infer<typeof schema>

export function ProfileEditPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, isLoading: userLoading, error: userError } = useCurrentUser()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  useEffect(() => {
    if (user?.email) setValue('email', user.email)
  }, [user?.email, setValue])

  if (userLoading) return <p className="text-slate-500">Đang tải…</p>
  if (userError || !user) return <p className="text-red-600">Không tải được thông tin tài khoản.</p>

  const onSubmit = async (data: FormData) => {
    setSubmitError(null)
    try {
      await updateProfile({ email: data.email.trim().toLowerCase() })
      queryClient.invalidateQueries({ queryKey: ['me'] })
      toast.success('Đã cập nhật thông tin')
      navigate('/profile', { replace: true })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Không thể cập nhật'
      setSubmitError(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-4">
        <Link
          to="/profile"
          className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          ← Thông tin cá nhân
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-bold">Cập nhật thông tin cá nhân</h1>
      <p className="mb-4 text-sm text-slate-500">Tên đăng nhập không thể thay đổi.</p>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Tên đăng nhập
          </label>
          <input
            type="text"
            value={user.username}
            readOnly
            disabled
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400"
          />
        </div>
        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            {...register('email')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        {submitError && <p className="mb-4 text-sm text-red-600">{submitError}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-600"
          >
            {isSubmitting ? 'Đang lưu…' : 'Lưu'}
          </button>
          <Link
            to="/profile"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:text-slate-300"
          >
            Hủy
          </Link>
        </div>
      </form>
    </div>
  )
}
