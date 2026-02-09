import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GoogleLogin } from '@react-oauth/google'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { getErrorMessageVi } from '@/utils'

declare global {
  interface Window {
    FB?: {
      init: (params: { appId: string; cookie?: boolean; xfbml?: boolean; version: string }) => void
      login: (callback: (res: { authResponse?: { accessToken: string } }) => void, options?: { scope?: string }) => void
    }
    fbAsyncInit?: () => void
  }
}

const loginSchema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tên đăng nhập'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

const registerSchema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tên đăng nhập'),
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>


const VITE_GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''
const VITE_FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID ?? ''

export function LoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<'login' | 'register'>('login')

  useEffect(() => {
    if (!VITE_FACEBOOK_APP_ID) return
    if (window.FB) return
    window.fbAsyncInit = () => {
      window.FB!.init({
        appId: VITE_FACEBOOK_APP_ID,
        cookie: true,
        xfbml: false,
        version: 'v18.0',
      })
    }
    const script = document.createElement('script')
    script.src = 'https://connect.facebook.net/vi_VN/sdk.js'
    script.async = true
    script.defer = true
    document.body.appendChild(script)
  }, [])

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '' },
  })

  const onLogin = async (data: LoginForm) => {
    try {
      const res = await api.post<{
        access_token: string | null
        user: { id: number; username: string; email: string; role: string; createdAt: string }
      }>('/api/auth/login', {
        username: data.username,
        password: data.password,
      })
      const token = res.data.access_token
      if (token) {
        localStorage.setItem('access_token', token)
        if (res.data.user) queryClient.setQueryData(['me'], res.data.user)
        toast.success('Đăng nhập thành công')
        navigate(res.data.user?.role === 'ADMIN' ? '/admin/users' : '/', { replace: true })
      }
    } catch (err: unknown) {
      toast.error(getErrorMessageVi(err, 'Sai tên đăng nhập hoặc mật khẩu.'))
    }
  }

  const handleOAuthSuccess = (res: { data: { access_token: string; user?: { role?: string; [key: string]: unknown } } }) => {
    const token = res.data.access_token
    if (token) {
      localStorage.setItem('access_token', token)
      if (res.data.user) queryClient.setQueryData(['me'], res.data.user)
      toast.success('Đăng nhập thành công')
      navigate(res.data.user?.role === 'ADMIN' ? '/admin/users' : '/', { replace: true })
    }
  }

  const handleGoogleSuccess = async (credential: string) => {
    try {
      const res = await api.post<{ access_token: string; user?: { role?: string; [key: string]: unknown } }>('/api/auth/google', { credential })
      handleOAuthSuccess(res)
    } catch (err: unknown) {
      toast.error(getErrorMessageVi(err))
    }
  }

  const handleFacebookLogin = () => {
    if (!window.FB) {
      toast.error('Facebook chưa tải xong. Thử lại sau.')
      return
    }
    window.FB.login(
      async (response) => {
        if (!response.authResponse?.accessToken) {
          toast.error('Đăng nhập Facebook thất bại hoặc đã hủy.')
          return
        }
        try {
          const res = await api.post<{ access_token: string; user?: { role?: string; [key: string]: unknown } }>('/api/auth/facebook', {
            accessToken: response.authResponse.accessToken,
          })
          handleOAuthSuccess(res)
        } catch (err: unknown) {
          toast.error(getErrorMessageVi(err))
        }
      },
      { scope: 'email,public_profile' }
    )
  }

  const onRegister = async (data: RegisterForm) => {
    try {
      const res = await api.post<{ access_token: string | null; user: unknown }>('/api/auth/register', {
        username: data.username,
        email: data.email,
        password: data.password,
      })
      if (!res.data.access_token) {
        toast.success('Đăng ký thành công. Vui lòng chờ admin duyệt tài khoản.')
        setMode('login')
        registerForm.reset()
      } else {
        localStorage.setItem('access_token', res.data.access_token)
        toast.success('Đăng nhập thành công')
        navigate('/', { replace: true })
      }
    } catch (err: unknown) {
      const msg = getErrorMessageVi(err)
      toast.error(msg)
      window.alert(msg)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-900">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex gap-2 border-b border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-sm font-medium ${
              mode === 'login'
                ? 'border-b-2 border-slate-800 text-slate-900 dark:border-white dark:text-white'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-sm font-medium ${
              mode === 'register'
                ? 'border-b-2 border-slate-800 text-slate-900 dark:border-white dark:text-white'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Đăng ký
          </button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={loginForm.handleSubmit(onLogin)} className="flex flex-col gap-4">
            <div>
              <label htmlFor="username" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Tên đăng nhập
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                {...loginForm.register('username')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
              {loginForm.formState.errors.username && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {loginForm.formState.errors.username.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...loginForm.register('password')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
              {loginForm.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loginForm.formState.isSubmitting}
              className="w-full rounded-lg bg-slate-800 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-600 dark:hover:bg-slate-500"
            >
              {loginForm.formState.isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
            </button>

            <div className="relative my-2 text-center text-xs text-slate-500 dark:text-slate-400">
              <span className="relative z-10 bg-white px-2 dark:bg-slate-800">hoặc</span>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-600" />
              </div>
            </div>

            {VITE_GOOGLE_CLIENT_ID && (
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    if (credentialResponse.credential) handleGoogleSuccess(credentialResponse.credential)
                  }}
                  onError={() => toast.error('Đăng nhập Google thất bại')}
                  useOneTap={false}
                  theme="filled_blue"
                  size="large"
                  text="continue_with"
                  locale="vi"
                />
              </div>
            )}
            {VITE_FACEBOOK_APP_ID && (
              <button
                type="button"
                onClick={handleFacebookLogin}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1877f2] px-4 py-2.5 font-medium text-white hover:bg-[#166fe5]"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Đăng nhập bằng Facebook
              </button>
            )}
          </form>
        ) : (
          <form onSubmit={registerForm.handleSubmit(onRegister)} className="flex flex-col gap-4">
            <div>
              <label htmlFor="reg-username" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Tên đăng nhập
              </label>
              <input
                id="reg-username"
                type="text"
                autoComplete="username"
                {...registerForm.register('username')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
              {registerForm.formState.errors.username && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {registerForm.formState.errors.username.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="reg-email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                {...registerForm.register('email')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
              {registerForm.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {registerForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="reg-password" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Mật khẩu (ít nhất 6 ký tự)
              </label>
              <input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                {...registerForm.register('password')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
              {registerForm.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {registerForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={registerForm.formState.isSubmitting}
              className="rounded-lg bg-slate-800 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-600 dark:hover:bg-slate-500"
            >
              {registerForm.formState.isSubmitting ? 'Đang đăng ký…' : 'Đăng ký'}
            </button>
            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              Sau khi đăng ký, tài khoản cần admin duyệt mới có thể đăng nhập.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
