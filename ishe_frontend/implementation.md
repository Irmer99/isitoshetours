# Ishe Tours Frontend — Implementation Blueprint

## Project Overview

React 19 + React Router v8 SPA. Tailwind v4 with Shadcn/Radix UI primitives. Two route branches:

- **Client-facing discovery** — home, itineraries, itinerary detail, destinations, contact
- **Admin dashboard** — login, bookings, clients, itineraries, destinations, discounts, settings

---

## Directory Structure

```
ishe_frontend/
├── app/
│   ├── components/
│   │   ├── layout/           # (inline in client-layout.tsx)
│   │   └── ui/               # Shadcn primitives (button, dialog, input, card, badge, chart, toast, etc.)
│   ├── contexts/
│   │   ├── AuthContext.tsx    # Shared auth state via React Context
│   │   └── ThemeContext.tsx   # Dark/light mode with localStorage persistence
│   ├── hooks/
│   │   ├── useAuth.ts        # Re-exports from AuthContext
│   │   ├── useInactivityLogout.ts # Session timeout with activity tracking
│   │   └── useSiteContact.ts # Dynamic contact info from SiteSettings (with fallback)
│   ├── lib/
│   │   ├── api-client.ts     # Axios instance with JWT interceptors (env-based URL)
│   │   ├── api-errors.ts     # Shared error parsing utilities
│   │   ├── constants.ts      # Shared constants (statusColors, CURRENCY, SITE_CONTACT)
│   │   ├── logger.ts         # Structured console logger (debug suppressed in prod)
│   │   ├── utils.ts          # Tailwind merge utility (`cn`)
│   │   └── validate.ts       # Zod validation helper
│   ├── routes/
│   │   ├── admin-layout.tsx  # Protected admin layout with sidebar
│   │   ├── client-layout.tsx # Public header, nav, footer, dark mode toggle
│   │   ├── admin/
│   │   │   ├── login.tsx
│   │   │   ├── forgot-password.tsx
│   │   │   ├── reset-password.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── bookings-list.tsx
│   │   │   ├── booking-detail.tsx
│   │   │   ├── client-tracker.tsx
│   │   │   ├── itinerary-manager.tsx
│   │   │   ├── destination-manager.tsx
│   │   │   ├── discount-manager.tsx
│   │   │   └── settings-manager.tsx
│   │   └── client/
│   │       ├── home.tsx
│   │       ├── itineraries.tsx
│   │       ├── itinerary-detail.tsx
│   │       ├── destinations.tsx
│   │       ├── destination-detail.tsx
│   │       ├── blog.tsx
│   │       ├── blog-detail.tsx
│   │       ├── terms.tsx
│   │       └── contact.tsx
│   ├── schemas/
│   │   ├── clientSchema.ts   # Zod schema for client enquiry forms
│   │   └── itinerarySchema.ts
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces matching backend models
│   ├── root.tsx              # Route tree, providers (QueryClient, Auth, Theme)
│   └── app.css               # Tailwind v4 + dark mode CSS variables
├── .env                      # VITE_API_URL (gitignored)
├── .env.example              # Template for environment variables
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Repo root (shared infrastructure)

```
ishe-tours/
├── .github/workflows/ci.yml   # GitHub Actions CI (typecheck + build + docker)
├── docker-compose.yml          # Production: frontend + backend + nginx + certbot
├── docker-compose.dev.yml      # Dev override: swaps nginx config for HTTP-only
├── deploy.sh                   # SSH-based VPS deploy script
├── nginx.conf                  # Production nginx (SSL, rate limiting, security headers)
├── nginx.dev.conf              # Dev nginx (HTTP only, no SSL, no bot blocking)
├── ishe_backend/               # Express API (see ishe_backend/progress.md)
└── ishe_frontend/              # React Router SSR SPA (this file)
```

---

## Route Architecture

### Client Views (Public)

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Hero, curated routes, testimonials |
| `/itineraries` | Itineraries | Package grid with search |
| `/itineraries/:slug` | ItineraryDetail | Day-by-day stepper, enquiry modal, WhatsApp redirect |
| `/destinations` | Destinations | Destination grid |
| `/destinations/:slug` | DestinationDetail | Destination info, linked itineraries |
| `/blog` | Blog | Blog post list with cards, tags, cover images |
| `/blog/:slug` | BlogDetail | Full blog post content, SEO metadata |
| `/terms` | Terms | Terms & Conditions page |
| `/contact` | Contact | Company info, contact form |

### Admin Panel Views (Protected)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/login` | AdminLogin | JWT auth gateway |
| `/admin/forgot-password` | ForgotPassword | Email input for password reset |
| `/admin/reset-password` | ResetPassword | New password form (token from URL) |
| `/admin/dashboard` | Dashboard | Metrics, charts (ChartContainer), conversion rates |
| `/admin/bookings` | BookingsList | Pipeline data table with status filter |
| `/admin/bookings/:id` | BookingDetail | Status history, customer info, pipeline progression |
| `/admin/clients` | ClientTracker | Search (debounced), booking history |
| `/admin/itineraries` | ItineraryManager | Multi-step package editor |
| `/admin/destinations` | DestinationManager | Destination CRUD |
| `/admin/discounts` | DiscountManager | Promo code CRUD |
| `/admin/notifications` | Notifications | Enquiry notifications, unread badge, mark-as-read |
| `/admin/blogs` | BlogManager | Blog CRUD with Tiptap editor |
| `/admin/settings` | SettingsManager | Global site config editor |

---

## Key Implementation Details

### 1. Call-To-Book Funnel (Client Side)

No payment processing. Flow:

1. Sticky summary box on itinerary detail page
2. "Enquire Now" triggers Dialog form
3. On submit (Zod-validated):
   - `POST /api/clients` → create/match client
   - `POST /api/bookings` → create booking (status: `enquiry`)
4. On 201 response → WhatsApp redirect using `SITE_CONTACT.phoneDigits`

### 2. Auth Flow

- `AuthContext` provides shared auth state via React Context
- 401 response clears admin data from localStorage and redirects to login
- Admin layout reads from context, not isolated `useAuth` calls

### 3. Dark Mode

- `ThemeProvider` wraps the app, reads `prefers-color-scheme` on first visit
- Persists to `localStorage`, inline `<script>` in `<head>` prevents FOUC
- Toggle button (Sun/Moon) in desktop nav and mobile menu

### 4. Dashboard Charts

- Uses `ChartContainer`/`ChartTooltip`/`ChartTooltipContent`/`ChartLegend`/`ChartLegendContent` from `components/ui/chart.tsx`
- `ChartConfig` objects define colors and labels for consistent theming

### 5. Structured Logging

- `lib/logger.ts` wraps `console.debug/info/warn/error` with component/action context
- Debug level suppressed in production (`import.meta.env.DEV`)
- Integrated in: API client error interceptor, AuthContext login/logout, inactivity logout hook

---

## Shared Utilities

### `lib/constants.ts`
```typescript
export const statusColors: Record<Booking["status"], ...> = { ... };
export const CURRENCY = "UGX";
export const SITE_CONTACT = {
  phone: "+256 787 699744",
  phoneDigits: "+256787699744",
  email: "info@isitoshetours.com",
  address: "Kyaliwajjala, Kampala, Uganda",
};
```

### `lib/api-errors.ts`
```typescript
export function parseApiError(err: unknown): string { ... }
export function parseFieldErrors(err: unknown): Record<string, string> { ... }
export function getErrorMessage(err: unknown): string { ... }
```

### `lib/validate.ts`
```typescript
export function validateWithSchema<T>(schema: ZodSchema<T>, data: unknown):
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };
```

### `lib/logger.ts`
```typescript
export const logger: {
  debug: (message: string, context?: LogContext, extra?: unknown) => void;
  info: (message: string, context?: LogContext, extra?: unknown) => void;
  warn: (message: string, context?: LogContext, extra?: unknown) => void;
  error: (message: string, context?: LogContext, extra?: unknown) => void;
};
// Debug suppressed in production (import.meta.env.DEV)
```

### `hooks/useSiteContact.ts`
```typescript
export function useSiteContact(): {
  phone: string; phoneDigits: string; email: string; address: string;
};
// Fetches from /api/content/site-settings, falls back to SITE_CONTACT constant
```

---

## Implementation Status

### Phase 1: Scaffold ✅
- [x] Vite + React 19 + TypeScript
- [x] Tailwind v4 with Shadcn/Radix UI
- [x] react-router v8, @tanstack/react-query, axios, zod, react-hook-form, @hookform/resolvers

### Phase 2: Foundation ✅
- [x] `lib/utils.ts` — `cn` utility
- [x] `lib/api-client.ts` — Axios instance with env-based URL + JWT interceptor
- [x] `types/index.ts` — all interfaces (Itinerary, Booking, Client, Discount, etc.)
- [x] `schemas/` — Zod schemas for client and itinerary forms
- [x] `lib/validate.ts` — Zod validation helper wired into forms
- [x] `lib/api-errors.ts` — shared error parsing (replaced 7+ duplicated blocks)
- [x] `lib/constants.ts` — shared statusColors, CURRENCY, SITE_CONTACT

### Phase 3: Client Routes ✅
- [x] `client-layout.tsx` — navbar, footer, dark mode toggle, responsive mobile menu
- [x] `home.tsx` — hero, curated routes, testimonials
- [x] `itineraries.tsx` — package grid with search, lazy-loaded images
- [x] `itinerary-detail.tsx` — day-by-day stepper, enquiry modal, Zod validation, images gallery
- [x] `destinations.tsx` — destination grid, lazy-loaded images
- [x] `destination-detail.tsx` — parallelized API calls, linked itineraries
- [x] `contact.tsx` — contact info (from SITE_CONTACT), form with Zod validation, form reset on success

### Phase 4: Admin Routes ✅
- [x] `AuthContext.tsx` — shared auth state via React Context
- [x] `admin-layout.tsx` — sidebar, header, protected route wrapper
- [x] `dashboard.tsx` — stats cards, ChartContainer-based charts, conversion rate
- [x] `bookings-list.tsx` — data table with status filter, shared statusColors
- [x] `booking-detail.tsx` — status history, pipeline progression, shared statusColors
- [x] `client-tracker.tsx` — debounced search, Zod validation
- [x] `itinerary-manager.tsx` — multi-step editor
- [x] `destination-manager.tsx` — destination CRUD (slug-based updates)
- [x] `discount-manager.tsx` — promo CRUD
- [x] `settings-manager.tsx` — site config editor

### Phase 5: Security ✅
- [x] Environment variable for API URL (`VITE_API_URL`)
- [x] `.env.example` template created
- [x] `AuthProvider` shared context (replaced isolated `useAuth` per component)
- [x] 401 interceptor clears admin data

### Phase 6: UX Improvements ✅
- [x] Debounced client search (300ms)
- [x] Contact form resets after successful submission
- [x] Itinerary detail images gallery
- [x] Parallelized API calls in destination-detail
- [x] Fixed blob URL memory leak in image upload
- [x] Malformed label whitespace fix

### Phase 7: Accessibility ✅
- [x] `aria-expanded` on toggles/accordions
- [x] `aria-label` on search inputs
- [x] `focus:opacity-100` on image delete button
- [x] `sr-only` on file input (was `hidden`)

### Phase 8: Performance ✅
- [x] `loading="lazy"` + `width`/`height` on all images
- [x] 10MB client-side upload validation
- [x] Responsive hero height fix

### Phase 9: Final Fixes ✅
- [x] Dashboard charts wired into `ChartContainer` component
- [x] Phone numbers centralized in `SITE_CONTACT` constant
- [x] Dark mode toggle with ThemeProvider + FOUC prevention
- [x] All hardcoded `"UGX"` replaced with `CURRENCY` constant

### Phase 10: Deployment Infrastructure ✅
Target: VPS (Hetzner/DigitalOcean), low traffic (< 100 visitors/day)

- [x] Backend Dockerfile — multi-stage Node 24 Alpine with tini
- [x] Docker Compose — orchestrate frontend, backend, and nginx containers
- [x] Nginx config — reverse proxy: SSL termination (Let's Encrypt), serve frontend, proxy `/api` to backend, serve `/uploads` as static files
- [x] Health check endpoint — `GET /health` on backend for nginx upstream checks
- [x] CORS update — env-driven, comma-separated multi-origin support
- [x] HTTP caching headers — `Cache-Control` on `/api/content` routes (300s TTL)

**Architecture:**
```
Internet → Nginx (SSL) → /uploads (static)
                      → /api/* → backend:3000
                      → /*     → frontend:5173
```

**What we're NOT adding (intentionally):**
- Load balancer — single server is sufficient
- Redis — in-memory rate limiting works fine with one instance
- CDN — low traffic, single server handles it
- Kubernetes / orchestration — overkill for this scale

### Phase 11: Security Hardening ✅

- [x] RBAC middleware (`requireRole`) — enforced on admin CUD operations
- [x] Admin existence check — authMiddleware verifies admin still exists in DB
- [x] Discount brute-force rate limit — 10 attempts/15min per IP on `POST /api/discounts/validate`
- [x] Client data leak fixed — public POST returns 409 + clientId only (no full record)
- [x] Hard deletes → soft deletes on bookings and discounts
- [x] Upload rate limiter — 30 uploads/min per authenticated admin
- [x] Discount response sanitized — `discountApplied` removed from public schema
- [x] SVG uploads removed — only JPEG/PNG/WebP/GIF allowed
- [x] SiteSettings validation tightened — length limits, URL format checks, phone regex
- [x] Booking history email leak fixed
- [x] Stats range capped at 365 days max
- [x] Refresh endpoint rate limited
- [x] Error handler hides internals in production

### Phase 12: Auth Features ✅

- [x] Password recovery — email-based flow via Resend API (forgot-password, reset-password)
- [x] Password change — admin settings page with current/new/confirm fields
- [x] JWT expiry — 14 days (configurable via JWT_EXPIRES_IN env)
- [x] Forgot/reset password pages — public routes with forms
- [x] Pagination — bookings and clients list endpoints now paginated (frontend updated)

### Phase 13: Session Management ✅

- [x] Inactivity auto-logout — 30-minute timeout, tracks mouse/key/click/scroll/touch activity
- [x] Session expiry warning — 60-second toast notification with "Stay logged in" button
- [x] `useInactivityLogout` hook — configurable timeout and warning duration
- [x] `SessionToast` component — lightweight bottom-right toast for session warnings
- [x] Integrated in `AdminLayout` — only active when `isAuthenticated` is true

### Phase 14: Blog System ✅

- [x] `Blog` model — slug, title, excerpt, content, coverImage, images[], tags[], archived, timestamps
- [x] Blog CRUD — `createBlog`, `getBlogs`, `getBlog`, `updateBlog`, `deleteBlog` in `content.controller.js`
- [x] Blog routes — `GET/POST /content/blogs`, `GET/PATCH/DELETE /content/blogs/:slug`
- [x] Admin blog manager — `blog-manager.tsx` with Tiptap rich-text editor, image upload, tag management
- [x] Client blog list — `blog.tsx` with card grid, cover images, tags, lazy-loaded images
- [x] Client blog detail — `blog-detail.tsx` with full content render, SEO metadata
- [x] Blog types — `Blog` interface in `types/index.ts`
- [x] Blog routes registered — `/blog`, `/blog/:slug` (client), `/admin/blogs` (admin)

### Phase 15: Notifications ✅

- [x] `Notification` model — type, title, message, read, link, meta, TTL index (90 days)
- [x] Notification controller — `list`, `unreadCount`, `markRead`, `markAllRead`
- [x] Notification routes — `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`
- [x] Admin notifications page — `notifications.tsx` with unread filter, pagination, mark-as-read
- [x] Sidebar badge — unread count indicator in admin layout with real-time polling (30s)
- [x] Notification types — `Notification` interface in `types/index.ts`

### Phase 16: Additional Pages ✅

- [x] Terms & Conditions — `terms.tsx` with full legal content (booking, liability, insurance, etc.)
- [x] Terms route — `/terms` (public)
- [x] Terms link in footer — Quick Links section in `client-layout.tsx`
- [x] Blog in navigation — Blog link in `client-layout.tsx` navLinks and footer
- [x] Custom favicon — PNG favicon via `<link rel="icon">` in `root.tsx`

### Phase 17: Polish & API Docs ✅

- [x] SiteSettings dynamic contact — `useSiteContact.ts` hook fetches phone/email/address from API, falls back to `SITE_CONTACT` constant
- [x] `itinerary-detail.tsx` migrated to `useSiteContact` — no remaining hardcoded `SITE_CONTACT` imports in routes
- [x] Dashboard chart legends — `ChartLegend`/`ChartLegendContent` wired into BarChart and LineChart
- [x] Swagger `security: []` — all public endpoints (GET content, POST bookings/clients/discounts/validate, POST auth/*) annotated to opt out of global bearerAuth
- [x] Frontend structured logging — `lib/logger.ts` with component/action context, integrated in `api-client.ts` (error interceptor), `AuthContext.tsx` (login/logout), `useInactivityLogout.ts` (warning/timeout)

### Phase 18: CI/CD Pipeline ✅

- [x] GitHub Actions workflow — `.github/workflows/ci.yml` with 3 jobs: frontend (typecheck + build), backend (install + syntax check), docker (build both images)
- [x] Node 24 caching — `actions/setup-node` with `cache-dependency-path` per service
- [x] `deploy.sh` — SSH-based VPS deploy script (manual use, future CD opt-in)
- [x] Triggered on push to `main` and PRs targeting `main`

---

## Remaining Items

- [x] Wire phone numbers to SiteSettings (dynamic from admin settings instead of hardcoded)
- [x] Wire `chart.tsx` Legend component (currently only Tooltip used)
- [x] Add Swagger auth optional access for public endpoints
- [x] Structured logging in frontend (currently only backend has pino)
- [x] CI/CD pipeline — GitHub Actions + deploy script
- [ ] Test infrastructure (user requested skip for now)

---

## Handover & Security Checklist

### Credentials to rotate before production deployment

| Credential | Current value | Action |
|-----------|---------------|--------|
| `MONGODB_URI` | Atlas connection string with dev password | Generate new DB user password in Atlas, update `.env` |
| `JWT_SECRET` | Hardcoded hex string in `.env` | Regenerate with `openssl rand -hex 64`, update `.env` |
| `ADMIN_EMAIL` | `pirmerpatricia99@gmail.com` | Change to production admin email |
| `ADMIN_PASSWORD` | `changeme` | Set strong password before seeding |
| `RESEND_API_KEY` | `***REMOVED***...` | Verify key is for production domain, not Resend sandbox |
| `SMTP_FROM` | `onboarding@resend.dev` | Update to verified domain after `isitoshetours.com` DNS verification |

### Git history audit

- `.env` is currently gitignored — verify it was **never committed**:
  ```bash
  git log --all --diff-filter=A -- ishe_backend/.env
  ```
- If it was committed, use `git filter-repo` or BFG Repo Cleaner to purge it from history

### Files with hardcoded values to clean

| File | Line | Issue | Fix |
|------|------|-------|-----|
| `ishe_backend/test-email.js` | 8 | Hardcoded `pirmerpatricia99@gmail.com` | Use `process.env.ADMIN_EMAIL` |
| `ishe_backend/progress.md` | 43, 160 | References dev email/password in seed docs | Update to placeholder values |

### `.env.example` files — should contain only placeholders

**`ishe_backend/.env.example`** — currently accurate, but add:
- `NODE_ENV=development`
- Document that `CORS_ORIGIN` accepts comma-separated values

**`ishe_frontend/.env.example`** — update to reflect Docker SSR setup:
```
# Client-side (baked at build time, used by browser)
# In Docker, this is set to /api (nginx proxies /api to backend)
VITE_API_URL=http://localhost:3000/api

# SSR server-side uses http://backend:3000/api automatically in Docker
```

### MongoDB Atlas checklist

- [ ] Create a dedicated production database user (not the dev one)
- [ ] Restrict Atlas IP access list to VPS IP only
- [ ] Enable audit logging (optional but recommended)
- [ ] Verify backup schedule is configured

### Domain & email checklist

- [ ] Verify `isitoshetours.com` domain in Resend for transactional email
- [ ] Set up SPF/DKIM records for email deliverability
- [ ] Update `SMTP_FROM` to use verified domain
- [ ] Configure DNS A record for VPS IP
- [ ] Set up Let's Encrypt certbot auto-renewal on VPS

### Post-deploy verification

- [ ] `GET /health` returns `{"status":"ok"}`
- [ ] Frontend loads with SSR data (itineraries, destinations, etc.)
- [ ] Admin login works with seeded credentials
- [ ] Swagger docs accessible at `/api-docs/` (superadmin auth only)
- [ ] File upload works (images appear in `/uploads/`)
- [ ] Password reset email delivers successfully
