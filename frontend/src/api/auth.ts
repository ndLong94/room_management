import { api } from '@/lib/api'
import type { User } from '@/types/user'

/** Login / register responses from `/api/auth/*` (shape aligned with backend). */
export type AuthUser = {
  id: number
  username: string
  email: string
  role: string
  createdAt: string
}

export type LoginResponse = {
  access_token: string | null
  user?: AuthUser
}

export type OAuthLoginResponse = {
  access_token: string
  user?: { role?: string; [key: string]: unknown }
}

export type RegisterResponse = {
  access_token: string | null
  user: unknown
}

export async function login(body: { username: string; password: string }): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/api/auth/login', body)
  return data
}

export async function register(body: { username: string; email: string; password: string }): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>('/api/auth/register', body)
  return data
}

export async function loginWithGoogle(credential: string): Promise<OAuthLoginResponse> {
  const { data } = await api.post<OAuthLoginResponse>('/api/auth/google', { credential })
  return data
}

export async function loginWithFacebook(accessToken: string): Promise<OAuthLoginResponse> {
  const { data } = await api.post<OAuthLoginResponse>('/api/auth/facebook', { accessToken })
  return data
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await api.get<User>('/api/auth/me')
  return data
}

export async function updateProfile(body: { email: string }): Promise<User> {
  const { data } = await api.put<User>('/api/auth/me', body)
  return data
}
