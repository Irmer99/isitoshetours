#!/usr/bin/env bash
set -euo pipefail

REMOTE="${VPS_HOST:-root@your-vps-ip}"
# HTTP phase (no domain yet): use the HTTP-only nginx config via the dev override.
# Domain/SSL phase: run with COMPOSE_FLAGS="" (or add --profile ssl).
COMPOSE_FLAGS="${COMPOSE_FLAGS:--f docker-compose.yml -f docker-compose.dev.yml}"

ssh "$REMOTE" "cd /opt/ishe-tours && git pull && docker compose $COMPOSE_FLAGS up --build -d && docker image prune -f"
