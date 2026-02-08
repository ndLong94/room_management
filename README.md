# Management

Full-stack app: Spring Boot 3.x backend (Java 17) + React (Vite + TypeScript) frontend.

## Quick start

- **Backend:** See [backend/README.md](backend/README.md) — Java 17, Maven, PostgreSQL database **`room_management`**.
- **Frontend:** See [frontend/README.md](frontend/README.md) — Node 18+, npm, `VITE_API_URL` config.

## Project layout

| Path | Description |
|------|-------------|
| `backend/` | Spring Boot API (config, global error handler, request-id logging). See **backend/README.md** for how to start and config. |
| `frontend/` | React app (navbar, sidebar, toasts, axios + auth). See **frontend/README.md** for how to start and config. |
| `docker-compose.yml` | Optional PostgreSQL for local dev (you can use your existing Postgres and database `room_management` instead). |

## Summary

- **Backend:** Java 17, Maven 3.9+. Uses PostgreSQL; database name **`room_management`**. Dev user: `admin` / `admin`.
- **Frontend:** React 18, Vite, TypeScript, latest stable npm deps. Set `VITE_API_URL` (e.g. `http://localhost:8080`).

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
