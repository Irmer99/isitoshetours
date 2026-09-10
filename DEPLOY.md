# Deploying to a DigitalOcean Droplet

The app runs as a Docker Compose stack on a single DigitalOcean droplet:

```
Internet → Nginx :80/:443
             ├─ /api/        → backend:3000
             ├─ /uploads/    → served as static files
             └─ /*           → frontend:5173 (React Router SSR)
```

| Service | What it runs | Port |
|---|---|---|
| `nginx` | Reverse proxy, TLS (future), rate limiting, security headers | 80 / 443 |
| `frontend` | React Router SSR (server + client) | 5173 |
| `backend` | Express/Node.js API + PostgreSQL (Supabase) | 3000 |
| `certbot` | Let's Encrypt renewal (only with `--profile ssl`) | — |

The frontend connects to the backend via the `SSR_API_URL` env var (server-side) and nginx routes (client-side). The database is **Supabase Postgres** — no database runs on the droplet.

---

## Current phase: HTTP on droplet IP (no domain yet)

Until a domain is pointed at the droplet, the site runs over plain HTTP using the
HTTP-only nginx config (`nginx.dev.conf`), swapped in via `docker-compose.dev.yml`.
SSL/certbot is disabled. This is a temporary phase — see "Domain & SSL" below.

## Phase 1 — Provision the droplet

1. Create a **Basic 2GB / 2 vCPU** droplet (Ubuntu 24.04 + Docker marketplace image, or plain Ubuntu then install Docker).
   - 2GB is recommended so `docker compose up --build` does not OOM during Node/Prisma builds.
2. Add your **SSH key** at creation time.
3. Create a **cloud firewall**: allow inbound on 22, 80 (and 443 once SSL is enabled).

## Phase 2 — First deploy

```bash
VPS_HOST=root@<droplet-ip> ./deploy.sh   # one-time; script clones nothing — run steps below first
```

The script only runs `git pull` + `docker compose up`, so set up the server once:

```bash
# 1. Clone the repo
git clone git@github.com:<you>/ishetours.git /opt/ishe-tours
cd /opt/ishe-tours

# 2. Create the backend env file (gitignored — NOT in the repo)
nano ishe_backend/.env

# 3. Create the uploads directory and copy existing uploads
mkdir -p uploads
scp -r ./ishe_backend/uploads/* root@<droplet-ip>:/opt/ishe-tours/uploads/

# 4. Build and start (HTTP phase)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

On startup the backend runs `prisma migrate deploy` and seeds the admin user
(idempotent — safe against the shared Supabase DB).

### Backend env (`/opt/ishe-tours/ishe_backend/.env`)

| Variable | Value |
|---|---|
| `DATABASE_URL` | Supabase pooler URL (port 6543, include `?sslmode=require`) |
| `DIRECT_DATABASE_URL` | Supabase direct URL (port 5432, for Prisma migrations) |
| `JWT_SECRET` | `openssl rand -hex 64` |
| `JWT_EXPIRES_IN` | `14d` |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `CORS_ORIGIN` | `http://<droplet-ip>` |
| `FRONTEND_URL` | `http://<droplet-ip>` |
| `ADMIN_EMAIL` | Production admin email |
| `ADMIN_PASSWORD` | Strong password (rotate — the old one is exposed in `render.yaml`) |
| `ADMIN_ROLE` | `superadmin` |
| `RESEND_API_KEY` | Production Resend key |
| `SMTP_FROM` | Verified sender (after domain DNS verification) |
| `SUPABASE_URL` | Supabase project URL (Project Settings → API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only secret for Supabase Storage uploads |
| `SUPABASE_STORAGE_BUCKET` | Public bucket for image uploads (default `images`) |

> `VITE_API_URL=/api` and `PORT=5173` are already set in `docker-compose.yml` for the frontend.

## Phase 3 — Verify

```bash
curl http://<droplet-ip>/health                 # {"status":"ok"}
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f
```

- Visit `http://<droplet-ip>` — site loads with SSR data
- Login at `http://<droplet-ip>/admin/login`
- Upload an image in admin; confirm it appears in `/uploads/`
- Test a password reset email

## Deploying updates

```bash
VPS_HOST=root@<droplet-ip> ./deploy.sh
```

`deploy.sh` runs `git pull`, rebuilds images, and restarts the stack. The `.env`
and `uploads/` directory are not in git — they persist on the droplet.

## Keeping the Render free tier alive

The Render deployment is left running so it stays on the free tier (750 instance
hours/month shared across services; free services sleep after 15 min idle and only
accrue hours while serving traffic — with the droplet as primary, Render stays at
~0 hours).

- `autoDeploy` is set to `false` in `render.yaml`, so pushes to `main` no longer
  rebuild Render.
- Both environments share the same Supabase database. The `migrate.yml` GitHub
  Action still runs Prisma migrations via `DIRECT_DATABASE_URL`.
- First hit to the Render URL after idle is slow (cold start) — expected.

---

## Domain & SSL (next phase)

1. Point an A record (`@` and `www`) at the droplet IP.
2. Set `DOMAIN=yourdomain.com` in `docker-compose.yml` (nginx service environment)
   so the `nginx.conf` template resolves the cert paths.
3. Issue the initial certificate:
   ```bash
   docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d yourdomain.com -d www.yourdomain.com
   ```
4. Restart with the production nginx config (drops the dev override):
   ```bash
   docker compose up --build -d --profile ssl
   ```
   (certbot renews automatically on a 12h loop; nginx auto-renews via reload).
5. Update `CORS_ORIGIN`/`FRONTEND_URL`/`SSR_API_URL` to `https://yourdomain.com`.

---

## File storage

New admin uploads are stored in a **public Supabase Storage bucket** (`images` by
default) via the backend relay endpoint (`POST /api/content/upload`), so they
persist and are served directly from `supabase.co` URLs. The upload endpoint
enforces per-context pixel limits (hero 1920×1080, about 1200×1500, itinerary/
destination/blog 1280×720) and a 10MB file-size cap.

Legacy files live on the droplet at `/opt/ishe-tours/uploads` (bind-mounted into
the backend and nginx containers) and keep serving old `/uploads/...` URLs from
existing records — do not delete the volume while old records reference it.
They are not backed up — schedule a periodic `rsync` to another host or DO
Spaces if historical uploads matter.

### Verify the bucket (one-time setup + smoke test)

1. In the Supabase dashboard create a **public** storage bucket named `images`
   (public so uploaded URLs load without signed tokens; the service-role key used
   by the backend bypasses RLS).
2. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET` in
   the backend `.env` (or Render env vars) and restart the backend.
3. Smoke test: log into `/admin`, upload a 1920×1080 JPEG in the homepage hero —
   expect success returning a `https://<project>.supabase.co/...` URL. Upload the
   same file in the about section (> 1200×1500 would be rejected) and upload a
   very wide image — expect a 400 with the pixel-limit message, and a client-side
   rejection before the request is sent.

## Troubleshooting

### Backend won't connect to Supabase
- Verify `DATABASE_URL` is set and reachable (the Supabase pooler requires TLS).
- Check `docker compose logs backend` for the migration/seed output.

### Frontend can't reach the backend
- Confirm nginx is running: `curl http://<droplet-ip>/api/content/site-settings`
- Confirm `SSR_API_URL` is set (server-side calls) — falls back to `http://backend:3000/api`.

### CORS errors
- `CORS_ORIGIN` must include the exact origin you browse from (`http://<droplet-ip>`, later `https://yourdomain.com`).

### Rebuilding takes long / OOM
- Docker builds Node 24 + Prisma; if the build dies, add swap or move to the 2GB droplet plan.

---

## Costs

- **Droplet**: Basic 1GB/1 vCPU (`ubuntu-s-1vcpu-512mb-10gb-ams3`) ≈ $4/mo
- **Database**: Supabase free tier ($0) — DB + Storage (see "Current data & scaling" below)
- **Render free tier**: $0 (dormant)
- **Total**: ~$4/mo

## Current data & scaling plan

The site is low-traffic (~30 visitors/week at peak) and the database is expected to
stay under ~100MB, so the current setup is deliberately minimal:

| Resource | Where it lives | Limit that matters |
|---|---|---|
| Database (Postgres) | Supabase free tier | 500MB DB, ~100MB expected → plenty of headroom |
| Image storage | Supabase Storage buckets + legacy `./uploads/` | 1GB storage, 5GB egress |
| App code | Droplet 178.62.200.63 (Docker Compose: nginx + frontend + backend) | 512MB RAM / 1 vCPU |

**The database is hosted externally on Supabase's free tier — no Postgres runs on the
droplet.** The free tier has a hard cap that can never *bill* you (no card on file means
overages block the service rather than charge), and a 7-day inactivity auto-pause that is
prevented by a keep-alive cron on the droplet hitting `/health` (which runs `SELECT 1`)
every 5 minutes.

### Going forward

These decisions are documented here so we don't re-derive them:

- **Stay on Supabase free tier.** At this traffic and data size the free limits are far
  from being hit, and it keeps the monthly cost at ~$4.
- **Re-evaluate before the Supabase plan expires (~1 year).** If the free plan ends, the
  options, in order of preference for this scale, are:
  1. **Upgrade Supabase to Pro** (~$25/mo) — zero code change, still fully managed.
  2. **Self-host Postgres on the droplet** — requires resizing the droplet up (Postgres'
     ~200MB baseline won't fit on 512MB alongside nginx + Node SSR + backend; a 2GB/1vCPU
     ≈ $14/mo or 2GB/2vCPU ≈ $24/mo is the practical minimum). Then point
     `DATABASE_URL`/`DIRECT_DATABASE_URL` at local Postgres and `prisma migrate deploy`
     (fresh DB is fine — start from migrations + seed). Image uploads would move from
     Supabase Storage to local disk in `./uploads/` (swap `lib/storage.js` to write files
     locally; nginx already serves `/uploads/`).
  3. **DO Managed Postgres** (~$15/mo) + **DO Spaces** (~$5/mo) for images — fully
     managed, no expiry, but the highest managed cost.
- **Scaling triggers** (adopt only when needed): if DB exceeds ~400MB, storage exceeds
  ~80% of 1GB, or egress approaches 5GB/mo, move to one of the options above rather than
  waiting for the plan to end.
