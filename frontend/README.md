# Management Frontend

React app (Vite + TypeScript) for the Management project.

## Requirements

- **Node.js 18+** (recommended: 20 LTS or 22)
- **npm** (latest stable; comes with Node)

### If `npm run dev` fails with "Unexpected token '??='"

Your Node.js is too old. Check with `node -v`. You need **Node 18 or higher**.

- **Install:** [https://nodejs.org](https://nodejs.org) — download the **LTS** version (20.x).
- After installing, **close and reopen** your terminal (or IDE), then run `npm run dev` again from the `frontend` folder.

## Configuration

### Environment variables

Create a `.env` file in the **frontend** directory (or copy from `.env.example`):

| Variable        | Example                 | Description                    |
|-----------------|-------------------------|--------------------------------|
| `VITE_API_URL`  | `http://localhost:8080` | Backend API base URL           |

Example:

```env
VITE_API_URL=http://localhost:8080
```

For production builds, set `VITE_API_URL` to your real API URL; Vite inlines it at build time.

### Dev proxy

In `vite.config.ts`, `/api` is proxied to the backend when using the dev server, so you can keep `VITE_API_URL` as `http://localhost:8080` or use relative URLs in dev.

## How to start

1. Install dependencies (from the **frontend** directory):

   ```bash
   cd frontend
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

3. Open **http://localhost:5173** in the browser.

4. Log in with the backend dev user (e.g. `admin` / `admin` if you use the default backend config).

## Scripts

| Command        | Description                    |
|----------------|--------------------------------|
| `npm run dev`  | Start Vite dev server          |
| `npm run build`| TypeScript check + production build |
| `npm run preview` | Serve production build locally |
| `npm run lint` | Run ESLint                     |

## Build for production

```bash
npm run build
```

Output is in `dist/`. Serve that folder with any static file server (e.g. nginx, or `npm run preview` for a quick check).

## Tech stack

- **React 18** + TypeScript  
- **Vite** – build and dev server  
- **Tailwind CSS** – styling  
- **React Router** – routing  
- **TanStack Query** – server state  
- **Axios** – HTTP client (token attached, 401 → redirect to login)  
- **Zod** + **React Hook Form** + **@hookform/resolvers** – forms and validation  
- **react-hot-toast** – toasts  
