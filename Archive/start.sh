#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================="
echo "Checking Host Prerequisites"
echo "=========================================="

# 1. Check Docker
if command -v docker >/dev/null 2>&1; then
  DOCKER_VERSION=$(docker --version)
  echo "✓ Docker is installed: $DOCKER_VERSION"
else
  echo "✗ Docker is not installed. Please install Docker before running the services."
  exit 1
fi

# 2. Check Docker Compose
COMPOSE_CMD=""
if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
  COMPOSE_VERSION=$(docker compose version)
  echo "✓ Docker Compose is installed: $COMPOSE_VERSION"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
  COMPOSE_VERSION=$(docker-compose --version)
  echo "✓ Docker Compose is installed: $COMPOSE_VERSION"
else
  echo "✗ Docker Compose is not installed. Please install Docker Compose before running the services."
  exit 1
fi

echo "=========================================="
echo "Starting All Services via Docker Compose..."
echo "=========================================="

# Run the docker compose configuration in the foreground to stream logs
# Pressing Ctrl+C will automatically stop all services.
cd "$ROOT_DIR"
$COMPOSE_CMD -f proxy/docker-compose.yml up 2>&1 | tee combined_logs.txt

