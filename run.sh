#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3006}"
HOST="${HOST:-0.0.0.0}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$ROOT_DIR"

# Usar servidor personalizado que deshabilita caché para desarrollo
if [ -f "$ROOT_DIR/server.py" ]; then
  PORT="$PORT" HOST="$HOST" exec python3 "$ROOT_DIR/server.py"
fi

echo "No se encontró server.py"
exit 1
