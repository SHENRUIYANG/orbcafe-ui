#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3000}"
HOST="${HOST:-127.0.0.1}"
LOG_FILE="${LOG_FILE:-/tmp/examples_dev.log}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "[restart] target: http://${HOST}:${PORT}"

PIDS="$(lsof -tiTCP:${PORT} -sTCP:LISTEN || true)"
if [[ -n "${PIDS}" ]]; then
  echo "[restart] stopping existing process(es): ${PIDS}"
  kill ${PIDS} || true
  sleep 1

  STILL_RUNNING="$(lsof -tiTCP:${PORT} -sTCP:LISTEN || true)"
  if [[ -n "${STILL_RUNNING}" ]]; then
    echo "[restart] force killing: ${STILL_RUNNING}"
    kill -9 ${STILL_RUNNING} || true
    sleep 1
  fi
else
  echo "[restart] no existing process on port ${PORT}"
fi

echo "[restart] starting Next.js dev server..."
nohup npm run dev -- --hostname "${HOST}" --port "${PORT}" > "${LOG_FILE}" 2>&1 &
NEW_PID=$!

sleep 2
if ps -p "${NEW_PID}" > /dev/null 2>&1; then
  echo "[restart] started. pid=${NEW_PID}"
  echo "[restart] log: ${LOG_FILE}"
else
  echo "[restart] failed to start. check log: ${LOG_FILE}"
  exit 1
fi

