/**
 * Chuẩn hóa thông báo lỗi từ API sang tiếng Việt để hiển thị popup/toast.
 */
const EN_TO_VI: Record<string, string> = {
  'Bad credentials': 'Tên đăng nhập hoặc mật khẩu không đúng.',
  'Unauthorized': 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.',
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
  'File is required': 'Vui lòng chọn file.',
  'File size must be at most 10 MB': 'Kích thước file tối đa 10 MB.',
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

const DEFAULT_VI = 'Có lỗi xảy ra. Vui lòng thử lại.'

/**
 * Lấy thông báo lỗi từ response API và trả về bản tiếng Việt (để hiển thị popup/toast).
 */
export function getErrorMessageVi(
  err: unknown,
  fallback: string = DEFAULT_VI
): string {
  const data = (err as { response?: { data?: { message?: string } } })?.response?.data
  const raw = data?.message?.trim()
  if (!raw) return fallback
  const translated = EN_TO_VI[raw]
  if (translated) return translated
  // Thử match theo prefix (vd: "Room not found: 1" -> "Không tìm thấy phòng.")
  const prefixKey = Object.keys(EN_TO_VI).find((k) => raw.startsWith(k))
  if (prefixKey) return EN_TO_VI[prefixKey]
  // Message đã là tiếng Việt hoặc chưa có trong map -> dùng nguyên bản
  return raw
}
