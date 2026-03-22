# Management

Full-stack **room / property management** app: landlords manage properties, rooms, leases, meter-based invoicing, and optional Zalo invoice notifications.

## Tech stack

| Layer | Stack |
|--------|--------|
| **Backend** | Java 17, Spring Boot 3.x, Spring Security (JWT), Spring Data JPA, Flyway, PostgreSQL, Spring Batch |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router, axios |
| **Ops** | Docker Compose (Postgres + API + static frontend), GitHub Actions CI |

## How to run (local)

1. **Database:** PostgreSQL with database `room_management` (see [backend/README.md](backend/README.md)). Or start Postgres via [docker-compose.yml](docker-compose.yml).
2. **Backend:** From `backend/`, configure `application-dev` (defaults in repo) or env vars, then `mvn spring-boot:run`.
3. **Frontend:** From `frontend/`, copy `.env.example` to `.env`, set `VITE_API_URL`, then `npm install` and `npm run dev`.

Details, env tables, and Swagger URL: [backend/README.md](backend/README.md), [frontend/README.md](frontend/README.md).

## CI

Push and pull requests to `main` / `master` run **Maven verify** (backend tests, including Testcontainers) and **npm lint + build** (frontend).

## Project layout

| Path | Description |
|------|-------------|
| `backend/` | REST API, Flyway migrations, batch jobs. See **backend/README.md**. |
| `frontend/` | SPA (auth, admin, properties, rooms, invoices). See **frontend/README.md**. |
| `docker-compose.yml` | Optional PostgreSQL + backend + frontend images for local or demo deploy. |

## Quick reference

- **Backend:** Java 17, Maven 3.9+. Database name **`room_management`**.
- **Frontend:** Node 18+, `VITE_API_URL` (e.g. `http://localhost:8080`).
- **Secrets:** Set **`JWT_SECRET`** (≥32 characters) in production; do not rely on dev-only defaults outside local development.

## Tích hợp Zalo (gửi tin nhắn hóa đơn)

App có thể gửi tin nhắn Zalo cho hóa đơn (template: phòng, tiền thuê, điện, nước, tổng, hạn thanh toán, link xem chi tiết) qua **Zalo Official Account (OA)**.

### Cấu hình

Trong `.env` (hoặc biến môi trường backend):

| Biến | Mô tả |
|------|--------|
| `ZALO_ENABLED` | `true` để bật gửi Zalo (mặc định `false`) |
| `ZALO_ACCESS_TOKEN` | Access token của Zalo OA (bắt buộc khi bật) |
| `APP_BASE_URL` | URL gốc của app, dùng cho link "Xem chi tiết" trong tin (vd: `https://yourdomain.com`) |

### Lấy Access Token Zalo OA

1. Đăng ký ứng dụng / Official Account tại [Zalo for Developers](https://developers.zalo.me).
2. Tạo **Official Account** và kết nối với app.
3. Lấy **Access token** (OA): dùng [OAuth API](https://developers.zalo.me/docs/zalo-oa/oauth) (authorization code → access token). Token có hạn; dùng refresh token để gia hạn theo tài liệu Zalo.
4. Đặt token vào `ZALO_ACCESS_TOKEN` và `ZALO_ENABLED=true`.

### Cách dùng trong app

- Vào **Hóa đơn** → mở **chi tiết một hóa đơn** → bấm **Gửi Zalo**.
- Nhập **Zalo user ID** của người nhận (ID này lấy từ trang quản lý Zalo OA khi user đã nhắn tin / tương tác với OA, hoặc từ webhook khi có tin nhắn đến).
- Tin nhắn gửi đi theo template: tiêu đề tháng/năm, tên phòng, tiền phòng, điện (kWh × đơn giá hoặc “Tiền điện = …” nếu giá cố định), nước tương tự, tổng, hạn thanh toán, link xem hóa đơn.
