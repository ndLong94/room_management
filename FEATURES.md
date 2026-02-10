# Tài Liệu Chi Tiết Tính Năng và Thiết Kế - Ứng Dụng Quản Lý Phòng Trọ

## 1. TỔNG QUAN ỨNG DỤNG

### 1.1. Mô tả
Ứng dụng web quản lý phòng trọ toàn diện, hỗ trợ quản lý bất động sản, phòng, người ở, hóa đơn điện nước, và các tính năng quản trị.

### 1.2. Công nghệ sử dụng
- **Backend:** Spring Boot 3.x, Java 17, PostgreSQL, JWT Authentication
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Query
- **Deployment:** Docker, Docker Compose, Nginx
- **Tích hợp:** Zalo Official Account (gửi tin nhắn hóa đơn)

### 1.3. Phân quyền người dùng
- **USER:** Người dùng thường, quản lý bất động sản và phòng của mình
- **ADMIN:** Quản trị viên, có quyền quản lý tất cả người dùng và feedback

---

## 2. KIẾN TRÚC HỆ THỐNG

### 2.1. Backend Architecture
- **RESTful API:** Tất cả endpoints theo chuẩn REST
- **Security:** JWT-based authentication, Spring Security
- **Database:** PostgreSQL với Flyway migrations
- **File Storage:** Local file system (có thể mount Docker volume)
- **Logging:** SLF4J/Logback với config theo profile (dev/prod)

### 2.2. Frontend Architecture
- **Routing:** React Router với protected routes
- **State Management:** React Query cho server state, React hooks cho local state
- **UI Framework:** Tailwind CSS với dark mode support
- **Form Handling:** React Hook Form + Zod validation
- **Notifications:** React Hot Toast

---

## 3. CÁC TÍNH NĂNG CHÍNH

### 3.1. QUẢN LÝ BẤT ĐỘNG SẢN (Properties)

#### 3.1.1. Danh sách bất động sản (`/properties`)
- **Hiển thị:** Danh sách tất cả bất động sản của user
- **Thông tin hiển thị:**
  - Tên bất động sản
  - Địa chỉ
  - Ghi chú
  - Số phòng (tổng, đã cho thuê, còn trống)
- **Hành động:**
  - Xem danh sách phòng
  - Cập nhật thông tin
  - Xóa bất động sản (chỉ khi không có phòng đang cho thuê)
- **Validation:** Không thể xóa nếu có phòng đang cho thuê (OCCUPIED)

#### 3.1.2. Thêm/Sửa bất động sản (`/properties/new`, `/properties/:id/edit`)
- **Thông tin nhập:**
  - Tên bất động sản (bắt buộc)
  - Địa chỉ (tùy chọn)
  - Ghi chú (tùy chọn)
  - Đơn giá điện (VND/kWh) - tùy chọn, dùng cho phòng không có giá cố định
  - Đơn giá nước (VND/m³) - tùy chọn, dùng cho phòng không có giá cố định
- **Validation:** Tên không được để trống, đơn giá phải ≥ 0

### 3.2. QUẢN LÝ PHÒNG (Rooms)

#### 3.2.1. Danh sách phòng (`/properties/:propertyId/rooms`)
- **Hiển thị:** Danh sách tất cả phòng trong một bất động sản
- **Thông tin hiển thị:**
  - Tên phòng
  - Giá thuê/tháng
  - Trạng thái (Đã cho thuê / Còn trống)
  - Ngày thanh toán hàng tháng
  - Tiền cọc và trạng thái cọc (Đã cọc/Chưa cọc) với màu sắc phân biệt:
    - Xanh lá: Đã cọc
    - Cam: Chưa cọc
  - Ngày cọc (định dạng "Ngày DD tháng MM YYYY")
- **Hành động:**
  - Xem hóa đơn
  - Cập nhật phòng
  - Xóa phòng
  - Xem lịch sử cho thuê
- **Navigation:** Nút "Quay lại" về danh sách bất động sản

#### 3.2.2. Tất cả phòng (`/rooms`)
- **Hiển thị:** Danh sách tất cả phòng từ tất cả bất động sản
- **Filters:**
  - Trạng thái (Tất cả / Đã cho thuê / Còn trống) - luôn hiển thị
  - Tìm kiếm (tên phòng hoặc bất động sản) - collapsed
  - Bất động sản (dropdown) - collapsed
- **Pagination:** Phân trang với PAGE_SIZE items/trang
- **Navigation:** Nút "Quay lại" về trang chủ

#### 3.2.3. Thêm/Sửa phòng (`/properties/:propertyId/rooms/new`, `/properties/:propertyId/rooms/:roomId/edit`)
- **Thông tin nhập:**
  - Tên phòng (bắt buộc)
  - Giá thuê/tháng (bắt buộc, ≥ 0)
  - Trạng thái (Còn trống / Đã cho thuê)
  - Ngày thanh toán hàng tháng (1-31, tùy chọn)
  - Hợp đồng (upload file, tùy chọn)
  - Tiền cọc (tùy chọn)
  - Ngày cọc (mặc định: hôm nay)
  - Đã cọc (checkbox, chỉ khi edit)
- **Khi chuyển từ "Còn trống" sang "Đã cho thuê":**
  - Modal yêu cầu nhập chỉ số điện nước ban đầu
  - Có thể nhập giá điện/nước cố định (nếu không có sẽ dùng đơn giá của bất động sản)
- **Validation:**
  - Tên không được để trống
  - Giá thuê ≥ 0
  - Chỉ số điện nước phải ≥ chỉ số ban đầu

#### 3.2.4. Lịch sử cho thuê (`/properties/:propertyId/rooms/:roomId/history`)
- **Hiển thị:** Danh sách các kỳ cho thuê đã kết thúc
- **Thông tin mỗi kỳ:**
  - Thời gian (từ tháng/năm đến tháng/năm)
  - Danh sách người ở trong kỳ đó
  - Thông tin đã lưu khi trả phòng:
    - Tiền đặt cọc
    - Ngày cọc
    - Ngày thanh toán
    - Hợp đồng (link)
    - Số điện nước cuối cùng (điện và nước)
- **Chi tiết kỳ:** Click vào kỳ để xem chi tiết người ở và thông tin đã lưu
- **Logic lưu số điện nước cuối cùng:**
  1. Ưu tiên: Meter reading của tháng hiện tại
  2. Nếu không có: Meter reading gần nhất (theo year DESC, month DESC)
  3. Nếu không có: Initial readings của phòng

### 3.3. QUẢN LÝ NGƯỜI Ở (Occupants)

#### 3.3.1. Danh sách người ở (`/properties/:propertyId/rooms/:roomId/occupants`)
- **Hiển thị:** Danh sách người ở trong một phòng
- **Thông tin hiển thị:**
  - Họ tên
  - SĐT (với prefix "SĐT:")
  - CCCD (với prefix "CCCD:")
  - Ghi chú
  - Tiền cọc và trạng thái cọc (màu xanh/cam)
- **Hành động:**
  - Xem chi tiết
  - Sửa thông tin
  - Xóa người ở
  - Thêm người ở mới (chỉ khi phòng đang cho thuê)
- **Upload files:** Hình cá nhân, CCCD mặt trước/sau, Tạm trú tạm vắng
- **Navigation:** Nút "Quay lại" về danh sách phòng

#### 3.3.2. Chi tiết người ở (`/properties/:propertyId/rooms/:roomId/occupants/:occupantId`)
- **Hiển thị:** Thông tin đầy đủ của một người ở
- **Thông tin:**
  - Họ tên, SĐT, CCCD, Địa chỉ, Ngày sinh
  - Ghi chú
  - Zalo User ID (nếu có)
  - Tất cả files đã upload (có thể xem và download)
- **Navigation:** Nút "Quay lại" về danh sách người ở

### 3.4. QUẢN LÝ HÓA ĐƠN (Invoices)

#### 3.4.1. Danh sách hóa đơn (`/invoices`)
- **Hiển thị:** Danh sách tất cả hóa đơn
- **Filters:**
  - Trạng thái (Tất cả / Chưa thanh toán / Đã thanh toán) - luôn hiển thị
  - Tháng/Năm (tùy chọn) - collapsed
  - Bất động sản (dropdown) - collapsed
  - Phòng (dropdown, phụ thuộc bất động sản) - collapsed
- **Thông tin hiển thị:**
  - Mã hóa đơn
  - Bất động sản / Phòng
  - Kỳ (tháng/năm)
  - Tổng tiền
  - Trạng thái (badge màu)
  - Ngày đến hạn
- **Hành động:** Click vào hóa đơn để xem chi tiết
- **Pagination:** Phân trang
- **Navigation:** Nút "Quay lại" về trang chủ

#### 3.4.2. Chi tiết hóa đơn (`/invoices/:id`)
- **Hiển thị:** Thông tin chi tiết một hóa đơn
- **Thông tin:**
  - Bất động sản, Phòng, Kỳ
  - Tiền phòng
  - Tiền điện (chi tiết: số kWh × đơn giá hoặc số tiền cố định)
  - Tiền nước (chi tiết: số m³ × đơn giá hoặc số tiền cố định)
  - Tổng tiền
  - Trạng thái thanh toán
  - Ngày đến hạn
  - Ngày thanh toán (nếu đã thanh toán)
- **Hành động:**
  - Đánh dấu đã thanh toán / Chưa thanh toán
  - Xóa hóa đơn (chỉ khi chưa thanh toán)
  - Gửi Zalo (nếu bật tính năng Zalo)
- **Navigation:** Nút "Quay lại" về danh sách hóa đơn

#### 3.4.3. Tạo hóa đơn (`/properties/:propertyId/rooms/:roomId/invoice`)
- **Chức năng:** Tạo hóa đơn cho một phòng trong một tháng/năm cụ thể
- **Quy trình:**
  1. Chọn tháng/năm
  2. Nhập chỉ số điện nước hiện tại (nếu phòng không có giá cố định)
  3. Hệ thống tự động tính:
     - Tiền điện = (chỉ số hiện tại - chỉ số tháng trước) × đơn giá
     - Tiền nước = (chỉ số hiện tại - chỉ số tháng trước) × đơn giá
  4. Tổng = Tiền phòng + Tiền điện + Tiền nước
- **Validation:**
  - Chỉ số điện nước phải ≥ chỉ số tháng trước
  - Không thể tạo hóa đơn cho tháng tương lai
  - Phòng phải đang cho thuê
- **Tự động lưu:** Khi tạo hóa đơn, hệ thống tự động lưu chỉ số điện nước (nếu chưa có)
- **Navigation:** Nút "Quay lại" về danh sách người ở

### 3.5. QUẢN LÝ CHỈ SỐ ĐIỆN NƯỚC (Meter Readings)

#### 3.5.1. Lưu chỉ số điện nước
- **Tự động:** Khi tạo hóa đơn, hệ thống tự động lưu chỉ số
- **Thủ công:** Có thể lưu chỉ số độc lập trên trang tạo hóa đơn
- **Validation:** Chỉ số phải ≥ chỉ số tháng trước

#### 3.5.2. Hiển thị chỉ số
- **Trên trang tạo hóa đơn:** Hiển thị chỉ số tháng trước để tham khảo
- **Trong lịch sử:** Lưu chỉ số cuối cùng khi phòng chuyển sang "Còn trống"

### 3.6. QUẢN LÝ FEEDBACK

#### 3.6.1. User Feedback (`/profile`)
- **Chức năng:** User có thể gửi ý kiến đóng góp
- **Thông tin nhập:**
  - Nội dung (tối đa 2000 ký tự)
- **Trạng thái:**
  - PENDING: Chờ xử lý
  - APPROVED: Đồng ý
  - REJECTED: Từ chối
  - RESOLVED: Đã giải quyết
- **Hành động của user:**
  - Gửi feedback mới
  - Sửa feedback của mình (chỉ khi PENDING)
  - Xóa feedback của mình (chỉ khi PENDING)
  - Trả lời feedback (conversation thread)
- **Conversation:** Hỗ trợ hội thoại giữa user và admin (lưu dưới dạng JSON)
- **Lưu ý:** Admin không thấy phần gửi feedback trên trang Profile

#### 3.6.2. Admin Feedback Management (`/admin/feedback`)
- **Chức năng:** Admin quản lý tất cả feedback
- **Filters:**
  - Trạng thái (Tất cả / PENDING / APPROVED / REJECTED / RESOLVED)
  - User/Phòng (dropdown)
- **Sắp xếp:** Theo ngày tạo (mới nhất trước)
- **Hành động:**
  - Duyệt (APPROVED)
  - Từ chối (REJECTED)
  - Đánh dấu đã giải quyết (RESOLVED)
  - Cập nhật ghi chú admin
  - Trả lời feedback (conversation thread)
- **Hiển thị:** Conversation thread giữa user và admin

### 3.7. QUẢN TRỊ NGƯỜI DÙNG (Admin Only)

#### 3.7.1. Danh sách người dùng (`/admin/users`)
- **Hiển thị:** Danh sách tất cả người dùng
- **Thông tin:** Username, Email, Role, Status
- **Hành động:** Xem chi tiết, Xóa user

#### 3.7.2. Chi tiết người dùng (`/admin/users/:userId`)
- **Hiển thị:** Thông tin đầy đủ của user
- **Hành động:** Xóa user

### 3.8. TRANG CHỦ / DASHBOARD (`/`)

#### 3.8.1. Liên kết nhanh
- Bất động sản
- Hóa đơn
- (Đơn giá đã bị ẩn khỏi màn hình chính)

#### 3.8.2. Thống kê
- Tổng số bất động sản
- Tổng số phòng
- Số phòng đã cho thuê
- Số phòng còn trống
- Tổng số hóa đơn
- Số hóa đơn chưa thanh toán

---

## 4. THIẾT KẾ UI/UX

### 4.1. Design System

#### 4.1.1. Màu sắc
- **Primary Actions:** Blue (600/700) - Hóa đơn, Xem chi tiết
- **Success/Add:** Emerald (600/700) - Thêm mới, Đã cọc
- **Warning:** Orange (600/700) - Chưa cọc
- **Danger:** Red (600/700) - Xóa
- **Update:** Slate (700/600) - Cập nhật
- **Cancel/Back:** Slate (200/300) - Quay lại, Hủy

#### 4.1.2. Typography
- **Headings:** Bold, text-xl (mobile) / text-2xl (desktop)
- **Body:** text-sm / text-base
- **Labels:** text-xs, font-medium, text-slate-500

#### 4.1.3. Spacing & Layout
- **Container:** max-w-7xl, mx-auto, padding responsive
- **Cards:** rounded-lg, border, shadow-sm, padding p-4
- **Buttons:** rounded-lg, padding px-4 py-2 (hoặc px-3 py-1.5 cho buttons nhỏ)

### 4.2. Responsive Design
- **Mobile First:** Grid layout tự động chuyển từ 1 cột sang nhiều cột
- **Breakpoints:** sm (640px), md (768px), lg (1024px)
- **Tables:** Scroll horizontal trên mobile, full width trên desktop

### 4.3. Dark Mode
- **Support:** Tất cả components hỗ trợ dark mode
- **Colors:** Sử dụng dark: prefix trong Tailwind classes

### 4.4. Navigation

#### 4.4.1. Sidebar
- **Desktop:** Sidebar cố định bên trái
- **Mobile:** Sidebar có thể collapse
- **Items:** Dashboard, Bất động sản, Hóa đơn, Phòng, Profile, Admin (nếu là admin)

#### 4.4.2. Breadcrumbs / Back Navigation
- **Pattern:** Tất cả màn hình có nút "Quay lại" ở cuối trang
- **Implementation:** Sử dụng `Link` với đường dẫn cụ thể (không dùng `navigate(-1)`)
- **Consistency:** Nút "Quay lại" luôn có cùng styling và vị trí

### 4.5. Form Design

#### 4.5.1. Input Fields
- **Style:** Rounded borders, focus ring, dark mode support
- **Validation:** Hiển thị lỗi ngay dưới field
- **Labels:** Luôn có label rõ ràng với dấu * cho required fields

#### 4.5.2. Buttons
- **Primary:** Blue background, white text
- **Secondary:** Slate background
- **Danger:** Red background
- **Disabled:** Opacity 50%, cursor not-allowed

### 4.6. Feedback & Notifications

#### 4.6.1. Toast Notifications
- **Success:** Green toast
- **Error:** Red toast
- **Info:** Blue toast
- **Position:** Top right

#### 4.6.2. Loading States
- **Text:** "Đang tải…"
- **Buttons:** Disabled với text "Đang lưu…", "Đang tạo…"

#### 4.6.3. Empty States
- **Message:** Rõ ràng, hướng dẫn user
- **Style:** Centered, muted colors

---

## 5. QUY TRÌNH NGHIỆP VỤ

### 5.1. Quy trình cho thuê phòng

1. **Tạo bất động sản**
   - Nhập thông tin bất động sản
   - Có thể đặt đơn giá điện/nước mặc định

2. **Tạo phòng**
   - Nhập thông tin phòng (tên, giá thuê)
   - Trạng thái mặc định: "Còn trống"

3. **Chuyển phòng sang "Đã cho thuê"**
   - Nhập chỉ số điện nước ban đầu
   - Có thể nhập giá điện/nước cố định
   - Có thể nhập tiền cọc, ngày cọc (hoặc để sau)

4. **Thêm người ở**
   - Nhập thông tin người ở
   - Upload các giấy tờ (CCCD, tạm trú, v.v.)

5. **Tạo hóa đơn hàng tháng**
   - Chọn tháng/năm
   - Nhập chỉ số điện nước hiện tại
   - Hệ thống tự động tính tiền
   - Tạo hóa đơn

6. **Thanh toán**
   - Đánh dấu hóa đơn đã thanh toán
   - Có thể gửi hóa đơn qua Zalo

7. **Trả phòng**
   - Chuyển phòng sang "Còn trống"
   - Hệ thống tự động:
     - Lưu thông tin vào lịch sử (tiền cọc, ngày cọc, hợp đồng, số điện nước cuối)
     - Xóa người ở
     - Clear các thông tin liên quan khỏi phòng

### 5.2. Quy trình quản lý giá

#### 5.2.1. Giá điện/nước
- **Cấp bất động sản:** Đơn giá mặc định (VND/kWh, VND/m³)
- **Cấp phòng:** Có thể đặt giá cố định (số tiền/tháng) hoặc dùng đơn giá của bất động sản
- **Tính toán:**
  - Nếu phòng có giá cố định: Dùng giá cố định
  - Nếu không: (Chỉ số hiện tại - Chỉ số tháng trước) × Đơn giá

### 5.3. Quy trình feedback

1. **User gửi feedback**
   - Nhập nội dung
   - Status: PENDING

2. **Admin xem và phản hồi**
   - Admin có thể trả lời trong conversation
   - User có thể trả lời lại

3. **Admin quyết định**
   - APPROVED: Đồng ý
   - REJECTED: Từ chối
   - RESOLVED: Đã giải quyết (sau khi conversation kết thúc)

---

## 6. BẢO MẬT VÀ PHÂN QUYỀN

### 6.1. Authentication
- **Method:** JWT (JSON Web Token)
- **Login:** Username/Password hoặc OAuth (Google/Facebook)
- **Token Storage:** localStorage (frontend)
- **Token Expiry:** 24 giờ (có thể config)

### 6.2. Authorization
- **User:** Chỉ có thể truy cập và chỉnh sửa dữ liệu của mình
- **Admin:** Có thể truy cập tất cả dữ liệu và quản lý users

### 6.3. Data Validation
- **Frontend:** Zod schema validation
- **Backend:** Jakarta Validation annotations
- **Database:** Constraints và foreign keys

### 6.4. File Upload Security
- **Types:** Chỉ cho phép ảnh và PDF
- **Size Limit:** Tối đa 5MB
- **Storage:** Local file system với proper permissions

---

## 7. TÍNH NĂNG ĐẶC BIỆT

### 7.1. Tích hợp Zalo
- **Chức năng:** Gửi hóa đơn qua Zalo Official Account
- **Template:** Bao gồm thông tin phòng, tiền thuê, điện, nước, tổng, hạn thanh toán, link xem chi tiết
- **Config:** Cần ZALO_ACCESS_TOKEN và ZALO_ENABLED=true

### 7.2. Lịch sử cho thuê
- **Tự động lưu:** Khi phòng chuyển từ "Đã cho thuê" sang "Còn trống"
- **Thông tin lưu:**
  - Thời gian cho thuê
  - Danh sách người ở
  - Tiền cọc, ngày cọc
  - Hợp đồng
  - Số điện nước cuối cùng

### 7.3. Conversation Thread (Feedback)
- **Format:** JSON array lưu trong database
- **Structure:** role (admin/user), userId, content, createdAt
- **Hiển thị:** Thread conversation giống chat

### 7.4. Case-insensitive Username/Email
- **Storage:** Username và email luôn được lưu dưới dạng lowercase
- **Lookup:** Tất cả queries sử dụng case-insensitive comparison

### 7.5. Date Formatting
- **Format:** "Ngày DD tháng MM YYYY" (ví dụ: "Ngày 29 tháng 2 2026")
- **Usage:** Hiển thị ngày cọc và các ngày quan trọng khác

---

## 8. VALIDATION RULES

### 8.1. Property
- Tên: Bắt buộc, tối đa 255 ký tự
- Địa chỉ: Tùy chọn, tối đa 500 ký tự
- Đơn giá điện/nước: ≥ 0

### 8.2. Room
- Tên: Bắt buộc, tối đa 255 ký tự
- Giá thuê: Bắt buộc, ≥ 0
- Chỉ số điện nước: ≥ chỉ số tháng trước

### 8.3. Occupant
- Họ tên: Bắt buộc
- SĐT, CCCD: Tùy chọn

### 8.4. Invoice
- Không thể tạo cho tháng tương lai
- Phòng phải đang cho thuê
- Chỉ số điện nước phải hợp lệ

### 8.5. Feedback
- Nội dung: Bắt buộc, tối đa 2000 ký tự

---

## 9. ERROR HANDLING

### 9.1. Frontend
- **Toast Notifications:** Hiển thị lỗi dễ hiểu cho user
- **Form Validation:** Hiển thị lỗi ngay dưới field
- **Loading States:** Disable buttons khi đang xử lý

### 9.2. Backend
- **Global Exception Handler:** Xử lý tất cả exceptions
- **HTTP Status Codes:** 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 409 (Conflict), 500 (Internal Server Error)
- **Error Messages:** Tiếng Việt, rõ ràng

---

## 10. PERFORMANCE & OPTIMIZATION

### 10.1. Frontend
- **React Query:** Cache và stale time để giảm API calls
- **Code Splitting:** Lazy loading routes
- **Image Optimization:** Lazy loading images

### 10.2. Backend
- **Database Indexes:** Trên các foreign keys và fields thường query
- **Pagination:** Tất cả list endpoints hỗ trợ pagination
- **Query Optimization:** Sử dụng JPA queries hiệu quả

---

## 11. DEPLOYMENT

### 11.1. Docker Setup
- **Backend:** Spring Boot app trong container
- **Frontend:** Nginx serving static files
- **Database:** PostgreSQL container
- **Volumes:** Uploads directory được mount

### 11.2. Environment Variables
- **Backend:** Database, JWT, Zalo config
- **Frontend:** API URL
- **Docker:** Ports, volumes

### 11.3. Logging
- **Dev:** INFO level cho app, DEBUG cho SQL (có thể tắt)
- **Prod:** WARN level cho root, INFO cho app, OFF cho SQL

---

## 12. TESTING CONSIDERATIONS

### 12.1. Functional Testing
- Tất cả CRUD operations
- Validation rules
- Business logic (tính toán hóa đơn, lưu lịch sử)
- Authorization (user chỉ thấy dữ liệu của mình)

### 12.2. Edge Cases
- Phòng chưa có chỉ số điện nước khi trả phòng
- Hóa đơn đã thanh toán không thể sửa
- Xóa bất động sản có phòng đang cho thuê
- Feedback conversation thread

### 12.3. UI/UX Testing
- Responsive design trên các kích thước màn hình
- Dark mode
- Navigation flow
- Form validation feedback

---

## 13. FUTURE ENHANCEMENTS (Có thể đề xuất)

1. **Báo cáo & Thống kê**
   - Biểu đồ doanh thu theo tháng
   - Thống kê tỷ lệ lấp đầy phòng
   - Báo cáo chi tiết điện nước

2. **Notifications**
   - Thông báo hóa đơn sắp đến hạn
   - Reminder thanh toán

3. **Export/Import**
   - Export hóa đơn ra PDF/Excel
   - Import danh sách phòng từ Excel

4. **Multi-language**
   - Hỗ trợ tiếng Anh

5. **Mobile App**
   - React Native app

---

## 14. TÓM TẮT CÁC TÍNH NĂNG ĐÃ IMPLEMENT

✅ Quản lý bất động sản (CRUD)
✅ Quản lý phòng (CRUD, trạng thái, tiền cọc)
✅ Quản lý người ở (CRUD, upload files)
✅ Quản lý hóa đơn (tạo, xem, đánh dấu thanh toán, xóa)
✅ Quản lý chỉ số điện nước
✅ Lịch sử cho thuê (tự động lưu khi trả phòng)
✅ Feedback với conversation thread
✅ Admin quản lý users và feedback
✅ Authentication (JWT, OAuth)
✅ Authorization (User/Admin)
✅ Responsive design với dark mode
✅ Navigation nhất quán với nút "Quay lại"
✅ Validation đầy đủ (frontend + backend)
✅ Error handling
✅ File upload với security
✅ Tích hợp Zalo (gửi hóa đơn)
✅ Case-insensitive username/email
✅ Date formatting tiếng Việt
✅ Pagination cho tất cả lists
✅ Filters và search
✅ Docker deployment

---

**Tài liệu này cung cấp cái nhìn tổng quan và chi tiết về tất cả các tính năng, thiết kế, và quy trình nghiệp vụ của ứng dụng. Có thể sử dụng để review, testing, hoặc làm tài liệu cho developers mới.**
