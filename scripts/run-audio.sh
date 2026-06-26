#!/usr/bin/env bash
#
# Generate vocabulary pronunciation audio inside an isolated virtualenv, so the
# build-time TTS dependency (edge-tts) never touches the system Python. This
# avoids Ubuntu's PEP 668 "externally-managed-environment" error.
#
# Usage:  npm run audio    (or: bash scripts/run-audio.sh)
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV="$ROOT/.venv"
PY_BIN="${PYTHON:-python3}"

if [ ! -x "$VENV/bin/python" ]; then
  echo "→ Creating isolated virtualenv at .venv ..."
  "$PY_BIN" -m venv "$VENV"
fi

echo "→ Ensuring edge-tts is installed in .venv ..."
"$VENV/bin/python" -m pip install --quiet --upgrade pip >/dev/null
"$VENV/bin/python" -m pip install --quiet -r "$ROOT/scripts/requirements.txt"

echo "→ Generating audio ..."
exec "$VENV/bin/python" "$ROOT/scripts/generate-vocab-audio.py" "$@"
