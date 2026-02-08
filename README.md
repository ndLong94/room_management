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
