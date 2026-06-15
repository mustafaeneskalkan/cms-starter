# CMS Starter

Next.js CMS starter wired to the [Backend Template](https://github.com/mustafaeneskalkan/backend) via same-origin proxying, cookie-based JWT auth, and Next.js 16 `proxy.ts` route protection.

## Prerequisites

- Node.js 20+
- Backend running on port `4000` (see `Server Apps/backend`)
- MongoDB configured for the backend
- SMTP configured if using registration / password reset emails

## Quick start

1. **Backend** — from the backend repo:

   ```bash
   npm install
   cp .env.example .env
   # Set MONGODB_URI, JWT secrets, SMTP, etc.
   npm run dev
   ```

   Ensure backend env includes:

   ```env
   CORS_ORIGIN=http://localhost:3000
   COOKIE_SAME_SITE=lax
   COOKIE_SECURE=false
   ```

2. **CMS** — from this repo:

   ```bash
   npm install
   cp .env.example .env.local
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

3. **Admin user** — create a user in the backend with `role: "Admin"` and a verified email, then sign in at `/login`.

## Architecture

| Layer | Role |
|---|---|
| `next.config.ts` rewrites | Proxies `/csrf-token`, `/health`, and `/api/*` to `BACKEND_URL` so httpOnly cookies are set on the CMS origin |
| `proxy.ts` | Redirects unauthenticated requests away from `/cms/*`; redirects authenticated users away from `/login` |
| `SessionContext` | CSRF handling, session refresh, public auth flows, and Admin role enforcement |
| CMS layout | Secondary Admin check and 403 UI if a non-admin session slips through |

```text
Browser → localhost:3000/api/* → rewrite → localhost:4000/api/*
Browser → /cms/* → proxy.ts (accessToken cookie) → CMS pages
```

## Auth flows

- **Login / register** — public routes via `/api/users/login` and `/api/users/register`
- **CMS access** — requires `user.role === "Admin"` (enforced after login and on session refresh)
- **Password reset** — `/reset-password` (request + token reset)
- **Admin demo** — `/cms/admin/sessions` calls `GET /api/admin/sessions/stats`

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `BACKEND_URL` | `http://localhost:4000` | Backend origin for Next.js rewrites |
| `ACCESS_TOKEN_COOKIE_NAME` | `accessToken` | Cookie name checked by `proxy.ts` |

## Scripts

```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run start  # Start production server
npm run lint   # ESLint
```

## API reference

See the backend OpenAPI spec: [Backend OpenAPI](https://github.com/mustafaeneskalkan/backend/blob/main/docs/openapi.bundle.yaml)
