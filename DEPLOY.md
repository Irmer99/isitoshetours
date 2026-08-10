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

Uploads live on the droplet at `/opt/ishe-tours/uploads` (bind-mounted into the
backend and nginx containers). Unlike Render, they **persist across redeploys**,
but they are not backed up — schedule a periodic `rsync` to another host or DO
Spaces.

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

- **Droplet**: Basic 2GB/2 vCPU ≈ $12/mo (1GB/1vCPU ≈ $6 if traffic stays low)
- **Database**: Supabase free tier (or paid plan as needed)
- **Render free tier**: $0 (dormant)
- **Total**: ~$12–18/mo
