#!/usr/bin/env bash
set -euo pipefail

REMOTE="${VPS_HOST:-root@your-vps-ip}"

ssh "$REMOTE" <<'EOF'
  cd /opt/ishe-tours
  git pull
  docker compose up --build -d
  docker image prune -f
EOF
