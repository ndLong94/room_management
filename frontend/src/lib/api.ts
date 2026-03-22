import axios, { AxiosError } from 'axios'

/** Error JSON body matches backend {@code com.management.dto.response.ErrorResponse} (camelCase). */
const API_URL = import.meta.env.VITE_API_URL ?? ''

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const LOGIN_PATH = '/login'

function getAccessToken(): string | null {
  return localStorage.getItem('access_token')
}

function clearAuth(): void {
  localStorage.removeItem('access_token')
  const currentPath = window.location.pathname + window.location.search
  if (currentPath !== LOGIN_PATH) {
    window.location.href = LOGIN_PATH
  }
}

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAuth()
    }
    return Promise.reject(error)
  }
)

export default api
