#!/usr/bin/env bash
set -euo pipefail

REMOTE="${VPS_HOST:-root@your-vps-ip}"
# NOTE: this script deploys via GHCR images (docker-compose.yml uses `image: ghcr.io/...`).
# It does NOT run the droplet's local build. The droplet is deployed manually with:
#   COMPOSE_FLAGS="-f docker-compose.yml -f docker-compose.dev.yml" docker compose build && up -d
# (the dev override swaps in build: directives + the HTTP-only nginx config).
# HTTP phase (no domain yet): use the HTTP-only nginx config via the dev override.
# Domain/SSL phase: run with COMPOSE_FLAGS="" (or add --profile ssl).
COMPOSE_FLAGS="${COMPOSE_FLAGS:--f docker-compose.yml -f docker-compose.dev.yml}"

ssh "$REMOTE" "cd /opt/ishe-tours && git pull && docker compose $COMPOSE_FLAGS up --build -d && docker image prune -f"
