#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cleanup() {
  echo "Stopping background processes..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup INT TERM

cd "$ROOT_DIR/proxy"
echo "Starting Docker services..."
sudo docker compose up -d

cd "$ROOT_DIR/backend"
echo "Starting backend..."
if [ -f "$ROOT_DIR/backend/mvnw" ]; then
  (bash "$ROOT_DIR/backend/mvnw" spring-boot:run 2>&1 | tee /tmp/new-tech-demo-backend.log) &
else
  echo "Maven wrapper not found; falling back to system Maven."
  (mvn spring-boot:run 2>&1 | tee /tmp/new-tech-demo-backend.log) &
fi
BACKEND_PID=$!

cd "$ROOT_DIR/frontend"
echo "Starting frontend..."
(npm run dev -- --host 0.0.0.0 2>&1 | tee /tmp/new-tech-demo-frontend.log) &
FRONTEND_PID=$!

echo "Backend logs: /tmp/new-tech-demo-backend.log"
echo "Frontend logs: /tmp/new-tech-demo-frontend.log"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:8080"
echo "Proxy: http://localhost/"
echo "Press Ctrl+C to stop all services."

while kill -0 "$BACKEND_PID" 2>/dev/null && kill -0 "$FRONTEND_PID" 2>/dev/null; do
  sleep 2
done

if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
  echo "Backend stopped unexpectedly. Check /tmp/new-tech-demo-backend.log"
fi

if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
  echo "Frontend stopped unexpectedly. Check /tmp/new-tech-demo-frontend.log"
fi

cleanup
