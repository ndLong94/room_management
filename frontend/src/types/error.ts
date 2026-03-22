/**
 * Mirrors backend {@code com.management.dto.response.ErrorResponse} (JSON camelCase).
 */
export type ApiErrorFieldError = {
  field?: string
  message?: string
  rejectedValue?: unknown
}

export type ApiErrorResponse = {
  requestId?: string
  timestamp?: string
  status?: number
  error?: string
  message?: string
  path?: string
  fieldErrors?: ApiErrorFieldError[]
}
