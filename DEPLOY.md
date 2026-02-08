# Deploy lên DigitalOcean Droplet

**Nginx:** Đã có sẵn trong container frontend (serve static + proxy `/api` sang backend). Không cần cài Nginx trên host.

**Không cần domain:** Có thể truy cập công khai bằng **IP Droplet** (vd: `http://164.92.xxx.xxx`). Chỉ cần set `CORS_ALLOWED_ORIGINS=http://IP_DROPLET` trong `.env`.

---

## 1. Chuẩn bị Droplet

- Tạo Droplet (Ubuntu 22.04), cài Docker và Docker Compose.
- Hoặc dùng One-Click Docker image nếu có.

## 2. Clone và cấu hình

```bash
git clone https://github.com/ndLong94/room_management.git
cd room_management
```

Tạo file `.env` (copy từ `.env.example` và sửa):

```bash
cp .env.example .env
nano .env
```

**Bắt buộc đổi trong production:**

- `POSTGRES_PASSWORD`: mật khẩu PostgreSQL mạnh.
- `JWT_SECRET`: chuỗi bí mật ít nhất 32 ký tự.
- `CORS_ALLOWED_ORIGINS`: URL mà user dùng để mở app. **Không có domain:** dùng `http://IP_DROPLET` (vd: `http://164.92.100.50`). **Có domain:** dùng `https://yourdomain.com`.

**OAuth (tùy chọn – đăng nhập Google/Facebook):**

- **Backend** (trong `.env`): `GOOGLE_CLIENT_ID`, `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`. Lấy từ Google Cloud Console (OAuth 2.0 Client ID) và Facebook for Developers (App ID + App Secret).
- **Frontend** (build-time): cần set `VITE_GOOGLE_CLIENT_ID` và `VITE_FACEBOOK_APP_ID` khi build (ví dụ trong CI hoặc Docker build args). Nếu không set thì nút Google/Facebook sẽ ẩn.
- **Google:** Trong OAuth Client cấu hình "Authorized JavaScript origins" và "Authorized redirect URIs" trùng với URL app (vd: `https://yourdomain.com`).
- **Facebook:** Trong App Settings → Basic thêm "App Domains" và trong Facebook Login → Settings thêm "Valid OAuth Redirect URIs".

**Zalo (tùy chọn – gửi tin nhắn hóa đơn):**

- `ZALO_ENABLED=true`, `ZALO_ACCESS_TOKEN=<token Zalo OA>`, `APP_BASE_URL=https://yourdomain.com` (hoặc `http://IP_DROPLET`). Xem [README.md](README.md#tích-hợp-zalo-gửi-tin-nhắn-hóa-đơn) để lấy token và Zalo user ID.

## 3. Build và chạy

```bash
docker compose build --no-cache
docker compose up -d
```

App chạy tại: **http://IP_DROPLET** (port 80). Đổi port qua biến `HTTP_PORT` trong `.env` nếu cần.

## 4. HTTPS (tùy chọn)

Dùng Nginx hoặc Caddy trên host làm reverse proxy, cấu hình SSL (Let's Encrypt). Docker Compose chỉ expose port 80; proxy trỏ về `localhost:80`.

## 5. Lệnh hữu ích

```bash
# Xem log
docker compose logs -f

# Dừng
docker compose down

# Rebuild sau khi đổi code
docker compose build --no-cache && docker compose up -d
```
