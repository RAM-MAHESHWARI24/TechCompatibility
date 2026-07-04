#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$ROOT_DIR/proxy"
echo "Starting Docker services..."
sudo docker compose up -d

cd "$ROOT_DIR/backend"
echo "Starting backend..."
(./mvnw spring-boot:run > /tmp/new-tech-demo-backend.log 2>&1) &
BACKEND_PID=$!

cd "$ROOT_DIR/frontend"
echo "Starting frontend..."
(npm run dev -- --host 0.0.0.0 > /tmp/new-tech-demo-frontend.log 2>&1) &
FRONTEND_PID=$!

cleanup() {
  echo "Stopping background processes..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT

echo "Backend logs: /tmp/new-tech-demo-backend.log"
echo "Frontend logs: /tmp/new-tech-demo-frontend.log"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:8080"
echo "Proxy: http://localhost/"
echo "Press Ctrl+C to stop all services."
wait "$BACKEND_PID" "$FRONTEND_PID"
