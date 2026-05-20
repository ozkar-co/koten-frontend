#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3006}"
HOST="${HOST:-0.0.0.0}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$ROOT_DIR"

echo "Sirviendo Koten Frontend en http://${HOST}:${PORT}"
echo "Directorio: $ROOT_DIR"

if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server "$PORT" --bind "$HOST"
fi

if command -v python >/dev/null 2>&1; then
  exec python -m http.server "$PORT" --bind "$HOST"
fi

if command -v npx >/dev/null 2>&1; then
  exec npx --yes serve -l "$PORT" -s .
fi

echo "No se encontro python3/python/npx para servir archivos estaticos."
exit 1
