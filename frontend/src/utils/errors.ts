import axios from 'axios'
import type { ApiErrorResponse } from '@/types/error'

/**
 * Chuẩn hóa thông báo lỗi từ API sang tiếng Việt để hiển thị popup/toast.
 * Nguồn: {@link parseApiError} (body JSON từ backend), ưu tiên {@link ApiErrorResponse.message}
 * và {@link ApiErrorResponse.fieldErrors} khi message là câu tổng quát.
 */
const EN_TO_VI: Record<string, string> = {
  'Bad credentials': 'Tên đăng nhập hoặc mật khẩu không đúng.',
  Unauthorized: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.',
  'Token has expired.': 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  'Access denied.': 'Bạn không có quyền thực hiện thao tác này.',
  'Resource not found.': 'Không tìm thấy tài nguyên.',
  'An unexpected error occurred.': 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
  'Validation Failed': 'Dữ liệu không hợp lệ.',
  'One or more fields have validation errors.': 'Một hoặc nhiều trường không hợp lệ.',
  'User not found': 'Không tìm thấy người dùng.',
  'Username already taken': 'Tên đăng nhập đã được sử dụng.',
  'Email already registered': 'Email đã được đăng ký.',
  'Cannot set status to DRAFT': 'Không thể đặt trạng thái thành DRAFT.',
  'Cannot change status of admin user': 'Không thể đổi trạng thái tài khoản admin.',
  'Property not found': 'Không tìm thấy bất động sản.',
  'Room not found': 'Không tìm thấy phòng.',
  'Invoice not found': 'Không tìm thấy hóa đơn.',
  'Occupant not found': 'Không tìm thấy người ở.',
  'Period not found for this room': 'Không tìm thấy kỳ cho thuê.',
  'Occupancy period not found': 'Không tìm thấy kỳ cho thuê.',
  'File is required': 'Vui lòng chọn file.',
  'Allowed types: jpg, jpeg, png, gif, webp, pdf, doc, docx': 'Chỉ chấp nhận file: jpg, jpeg, png, gif, webp, pdf, doc, docx.',
  'Full name is required': 'Vui lòng nhập họ tên.',
  'Name is required': 'Vui lòng nhập tên.',
  'Username is required': 'Vui lòng nhập tên đăng nhập.',
  'Email is required': 'Vui lòng nhập email.',
  'Password is required': 'Vui lòng nhập mật khẩu.',
  'Credential is required': 'Thông tin đăng nhập Google không hợp lệ.',
  'Access token is required': 'Thông tin đăng nhập Facebook không hợp lệ.',
  'Invalid email format': 'Email không đúng định dạng.',
  'Password must be between 6 and 100 characters': 'Mật khẩu phải từ 6 đến 100 ký tự.',
  'Authentication required.': 'Vui lòng đăng nhập.',
}

/** Prefixes (backend may append ": id") */
const EN_PREFIX_TO_VI: Array<{ prefix: string; vi: string }> = [
  { prefix: 'File size must be at most', vi: 'Kích thước file vượt quá giới hạn cho phép.' },
  { prefix: 'Occupancy period not found', vi: 'Không tìm thấy kỳ cho thuê.' },
]

const GENERIC_BODY_MESSAGES = new Set([
  'Một hoặc nhiều trường không hợp lệ.',
  'Một hoặc nhiều tham số không hợp lệ.',
])

export const DEFAULT_API_ERROR_VI = 'Có lỗi xảy ra. Vui lòng thử lại.'

const NETWORK_VI = 'Không kết nối được máy chủ. Vui lòng thử lại.'

function isRecord(data: unknown): data is Record<string, unknown> {
  return data !== null && typeof data === 'object' && !Array.isArray(data)
}

/**
 * Trích body lỗi chuẩn từ Axios (align backend {@code ErrorResponse}).
 */
export function parseApiError(err: unknown): ApiErrorResponse | null {
  if (!axios.isAxiosError(err)) return null
  const data = err.response?.data
  if (!isRecord(data)) return null
  const msg = data.message
  const fe = data.fieldErrors
  const hasMsg = typeof msg === 'string'
  const hasFields = Array.isArray(fe) && fe.length > 0
  if (!hasMsg && !hasFields) return null
  return data as unknown as ApiErrorResponse
}

/** HTTP status từ response (ưu tiên header, không dùng body.status). */
export function getHttpStatus(err: unknown): number | undefined {
  if (!axios.isAxiosError(err)) return undefined
  return err.response?.status
}

export function isApiErrorStatus(err: unknown, status: number): boolean {
  return getHttpStatus(err) === status
}

function joinFieldErrors(parsed: ApiErrorResponse): string | null {
  const list = parsed.fieldErrors
  if (!list?.length) return null
  const parts = list
    .map((f) => (typeof f.message === 'string' ? f.message.trim() : ''))
    .filter(Boolean)
  if (!parts.length) return null
  return parts.join(' · ')
}

function translateMessage(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return raw
  const exact = EN_TO_VI[trimmed]
  if (exact) return exact
  const prefix = EN_PREFIX_TO_VI.find((e) => trimmed.startsWith(e.prefix))
  if (prefix) return prefix.vi
  const legacyPrefix = Object.keys(EN_TO_VI).find((k) => trimmed.startsWith(k))
  if (legacyPrefix) return EN_TO_VI[legacyPrefix]
  return raw
}

/**
 * Lấy thông báo hiển thị (toast) từ lỗi API hoặc lỗi mạng.
 */
export function getErrorMessageVi(err: unknown, fallback: string = DEFAULT_API_ERROR_VI): string {
  if (axios.isAxiosError(err) && !err.response) {
    return NETWORK_VI
  }

  const parsed = parseApiError(err)
  if (!parsed) {
    return fallback
  }

  const fieldJoined = joinFieldErrors(parsed)
  const raw = typeof parsed.message === 'string' ? parsed.message.trim() : ''

  if (fieldJoined) {
    if (!raw || GENERIC_BODY_MESSAGES.has(raw)) {
      return translateMessage(fieldJoined)
    }
  }

  if (!raw) {
    if (fieldJoined) return translateMessage(fieldJoined)
    return fallback
  }

  return translateMessage(raw)
}
