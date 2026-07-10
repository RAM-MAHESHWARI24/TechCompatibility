# New Tech Demo

## Overview

This repository is a full-stack demo app with three main parts:

- `backend/` — Java Spring Boot app using Maven and MySQL.
- `frontend/` — React + Vite app written in TypeScript.
- `proxy/` — Docker Compose setup for MySQL and Nginx reverse proxy.

The proxy routes:

- `/` → frontend dev server on `localhost:5173`
- `/api/` → backend on `localhost:8080`

## Prerequisites

You need the following on your machine:

- Git
- Docker Engine + Docker Compose

### Ubuntu install commands

```bash
sudo apt-get update
sudo apt-get install -y git docker.io docker-compose-v2
sudo usermod -aG docker $USER
newgrp docker
```

### Verify the installation

```bash
git --version
docker --version
docker compose version
```

If Docker still does not resolve correctly, use the manual install fallback section near the bottom.

## Quick start

If you are starting from a fresh machine, clone the repository first:

```bash
git clone https://github.com/RAM-MAHESHWARI24/TechCompatibility.git
cd TechCompatibility
```

### 1. Start the Docker services

```bash
cd proxy
sudo docker compose up -d
```

This starts:

- `database` — MySQL 8.0
- `reverse-proxy` — Nginx

### 2. Start the app

From the repository root, run:

```bash
./start.sh
```

The script starts:

- the backend on `http://localhost:8080`
- the frontend on `http://localhost:5173`
- the proxy on `http://localhost/`

> If the app was already installed locally, you can skip `npm install` and just run the script.

### Open the app in a browser

- Frontend direct: `http://localhost:5173`
- Through proxy: `http://localhost/`

## You can Verify the setup using below steps/commands

### Check Docker containers

```bash
sudo docker compose -f proxy/docker-compose.yml ps
```

Look for `database` and `reverse-proxy` in the `Up` state.

### Check backend health endpoint

```bash
curl http://localhost:8080/api/check
```

Expected output is JSON with `status` and `mysqlVersion` fields.

### Check the proxy path

```bash
curl http://localhost/api/check
```

If this succeeds, Nginx is forwarding `/api/` to the backend.



## Important notes

- `proxy/docker-compose.yml` does not start the backend or frontend apps.
- It only starts MySQL and Nginx.
- You must run the backend and frontend separately manually or by using start.sh script.

### Backend database configuration

The backend uses the following database settings in `backend/src/main/resources/application.properties`:

- URL: `jdbc:mysql://localhost:3306/pot_db?useSSL=false&allowPublicKeyRetrieval=true`
- Username: `pot_user`
- Password: `pot_pass`

The app currently sets:

```properties
spring.jpa.hibernate.ddl-auto=none
```

That means the database schema is not auto-created. Ensure the `pot_db` database exists and the expected tables are present before starting the backend.

## Project structure

- `backend/`
  - `pom.xml` — Maven build file
  - `src/main/java/...` — Spring Boot source code
  - `src/main/resources/application.properties` — backend configuration
- `frontend/`
  - `package.json` — app dependencies and scripts
  - `vite.config.ts` — Vite config
  - `src/` — React source files
- `proxy/`
  - `docker-compose.yml` — Docker Compose services
  - `default.conf` — Nginx proxy config

## Commands reference

### Backend

```bash
cd backend
./mvnw clean package
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Proxy & database

```bash
cd proxy
sudo docker compose up -d
```

### Stop Docker services

```bash
cd proxy
sudo docker compose down
```

## Manual install fallback

If Docker does not resolve correctly or the startup script fails because the local toolchain is missing, install the required tools manually:

```bash
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y git openjdk-17-jdk nodejs npm docker.io docker-compose-v2
sudo usermod -aG docker $USER
newgrp docker
```

Then verify:

```bash
git --version
java -version
node -v
npm -v
docker --version
docker compose version
```

## If something fails

- Check backend logs for startup errors.
- Check frontend terminal for Vite errors.
- Check Docker logs:

```bash
sudo docker compose -f proxy/docker-compose.yml logs --tail 50
```

- Make sure Docker is running and the ports are not blocked.

---

If you want, I can also help add a root-level Docker Compose setup that launches backend and frontend too.