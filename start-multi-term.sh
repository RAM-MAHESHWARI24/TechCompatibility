#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$ROOT_DIR/proxy/docker-compose.yml"

echo "=========================================="
echo "Checking Dependencies..."
echo "=========================================="

# 1. Check Docker
if command -v docker >/dev/null 2>&1; then
  DOCKER_VERSION=$(docker --version)
  echo "✓ Docker is installed: $DOCKER_VERSION"
else
  echo "✗ Docker is not installed. Please install Docker."
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
  echo "✗ Docker Compose is not installed. Please install Docker Compose."
  exit 1
fi

echo "=========================================="
echo "Determining Terminal Emulator..."
echo "=========================================="

# Commands to execute for each service
CMD_DB_NGINX="$COMPOSE_CMD -f $COMPOSE_FILE up pot-mysql pot-nginx"
CMD_BACKEND="$COMPOSE_CMD -f $COMPOSE_FILE up backend"
CMD_FRONTEND="$COMPOSE_CMD -f $COMPOSE_FILE up frontend"

# Check if tmux is active and available
if [ -n "${TMUX:-}" ] && command -v tmux >/dev/null 2>&1; then
  echo "✓ Tmux session detected. Splitting panes..."
  # Split the current window into 3 panes
  tmux split-window -h -t "${TMUX_PANE}" "$CMD_BACKEND"
  tmux split-window -v -t "${TMUX_PANE}" "$CMD_FRONTEND"
  # Run the DB/Nginx command in the original pane
  eval "$CMD_DB_NGINX"

# Check for GNOME Terminal (Common in Ubuntu/Debian desktop)
elif command -v gnome-terminal >/dev/null 2>&1; then
  echo "✓ GNOME Terminal detected. Launching 3 terminal windows..."
  
  gnome-terminal --title="MySQL & Nginx" -- bash -c "$CMD_DB_NGINX; exec bash"
  sleep 1 # brief pause to let db start initializing
  gnome-terminal --title="Spring Boot Backend" -- bash -c "$CMD_BACKEND; exec bash"
  gnome-terminal --title="React Frontend" -- bash -c "$CMD_FRONTEND; exec bash"
  
  echo "Terminals launched! You can monitor them in the new windows."

# Check for xterm (Universal fallback for GUI environments)
elif command -v xterm >/dev/null 2>&1; then
  echo "✓ xterm detected. Launching 3 terminal windows..."
  
  xterm -title "MySQL & Nginx" -e "$CMD_DB_NGINX" &
  sleep 1
  xterm -title "Spring Boot Backend" -e "$CMD_BACKEND" &
  xterm -title "React Frontend" -e "$CMD_FRONTEND" &
  
  echo "Terminals launched!"

# Fallback: run them in the background and tail them separately
else
  echo "⚠ No supported GUI terminal (gnome-terminal, xterm) or tmux session detected."
  echo "Running services in the background and tailing logs..."
  
  # Ensure clean exit by stopping background tasks on Ctrl+C
  cleanup() {
    echo "Stopping services..."
    $COMPOSE_CMD -f "$COMPOSE_FILE" down
  }
  trap cleanup INT TERM
  
  $COMPOSE_CMD -f "$COMPOSE_FILE" up -d
  
  echo ""
  echo "Services are running in the background. To view logs in separate terminals, run:"
  echo "  Terminal 1 (DB & Nginx):  docker logs -f proxy-pot-mysql-1 & docker logs -f proxy-pot-nginx-1"
  echo "  Terminal 2 (Backend):     docker logs -f proxy-backend-1"
  echo "  Terminal 3 (Frontend):    docker logs -f proxy-frontend-1"
  echo ""
  echo "Press Ctrl+C to stop services..."
  
  # Keep script alive to wait for stop
  while true; do sleep 1; done
fi
