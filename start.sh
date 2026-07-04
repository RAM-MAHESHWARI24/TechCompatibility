#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

detect_java_home() {
  if [ -n "${JAVA_HOME:-}" ] && [ -x "$JAVA_HOME/bin/java" ]; then
    export JAVA_HOME
    export PATH="$JAVA_HOME/bin:$PATH"
    return 0
  fi

  if command -v java >/dev/null 2>&1; then
    JAVA_BIN="$(command -v java)"
    JAVA_HOME="$(dirname "$(dirname "$JAVA_BIN")")"
    if [ -x "$JAVA_HOME/bin/java" ]; then
      export JAVA_HOME
      export PATH="$JAVA_HOME/bin:$PATH"
      return 0
    fi
  fi

  for candidate in \
    /usr/lib/jvm/java-17-openjdk-amd64 \
    /usr/lib/jvm/java-17-openjdk \
    /usr/lib/jvm/default-java \
    /usr/lib/jvm/java-21-openjdk-amd64 \
    /usr/lib/jvm/java-11-openjdk-amd64; do
    if [ -x "$candidate/bin/java" ]; then
      JAVA_HOME="$candidate"
      export JAVA_HOME
      export PATH="$JAVA_HOME/bin:$PATH"
      return 0
    fi
  done

  return 1
}

run_docker_compose() {
  if command -v docker >/dev/null 2>&1; then
    if docker compose version >/dev/null 2>&1; then
      docker compose "$@"
    elif command -v docker-compose >/dev/null 2>&1; then
      docker-compose "$@"
    elif command -v sudo >/dev/null 2>&1; then
      sudo docker compose "$@"
    else
      echo "Docker Compose is not available."
      exit 1
    fi
  else
    echo "Docker is not installed."
    exit 1
  fi
}

install_prerequisites() {
  echo "Installing missing prerequisites for Ubuntu/WSL..."
  sudo apt-get update
  sudo apt-get install -y openjdk-17-jdk nodejs npm docker.io docker-compose-v2
  sudo usermod -aG docker "$USER" 2>/dev/null || true
  if command -v newgrp >/dev/null 2>&1; then
    echo "Please run 'newgrp docker' once or log out/in to refresh Docker group permissions."
  fi
}

check_prerequisites() {
  local missing=()
  local installed=()

  if command -v docker >/dev/null 2>&1; then
    installed+=("docker")
  else
    missing+=("docker")
  fi

  if docker compose version >/dev/null 2>&1 2>/dev/null || command -v docker-compose >/dev/null 2>&1; then
    installed+=("docker compose")
  else
    missing+=("docker compose")
  fi

  if detect_java_home; then
    installed+=("java")
  else
    missing+=("java")
  fi

  if command -v node >/dev/null 2>&1; then
    installed+=("node")
  else
    missing+=("node")
  fi

  if command -v npm >/dev/null 2>&1; then
    installed+=("npm")
  else
    missing+=("npm")
  fi

  echo "Detected tools: ${installed[*]:-none}"

  if [ ${#missing[@]} -gt 0 ]; then
    echo "Missing required tools: ${missing[*]}"
    echo "Installing them now..."
    install_prerequisites
    echo "Re-checking prerequisites..."
    check_prerequisites
  fi
}

cleanup() {
  echo "Stopping background processes..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup INT TERM

check_prerequisites

if grep -qi microsoft /proc/version 2>/dev/null; then
  echo "WSL environment detected; using Linux-style paths and commands."
fi

cd "$ROOT_DIR/proxy"
echo "Starting Docker services..."
run_docker_compose up -d

cd "$ROOT_DIR/backend"
echo "Starting backend..."
if [ -f "$ROOT_DIR/backend/mvnw" ]; then
  (bash "$ROOT_DIR/backend/mvnw" spring-boot:run 2>&1 | tee /tmp/new-tech-demo-backend.log) &
else
  if ! command -v mvn >/dev/null 2>&1; then
    echo "Maven wrapper not found and Maven is not installed. Install it with: sudo apt install -y maven"
    exit 1
  fi
  echo "Maven wrapper not found; falling back to system Maven."
  (mvn spring-boot:run 2>&1 | tee /tmp/new-tech-demo-backend.log) &
fi
BACKEND_PID=$!

cd "$ROOT_DIR/frontend"
if [ ! -d "$ROOT_DIR/frontend/node_modules" ] || [ ! -x "$ROOT_DIR/frontend/node_modules/.bin/vite" ]; then
  echo "Installing frontend dependencies..."
  npm install --no-fund --no-audit
fi

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
