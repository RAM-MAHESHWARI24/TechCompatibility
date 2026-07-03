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

Install the following on your machine:

- Java 17
- Maven (or use the included wrapper `./mvnw`)
- Node.js and npm
- Docker and Docker Compose

### Ubuntu dependency install

```bash
# 1. Update the system package index to ensure you get the latest versions
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Git for version control
sudo apt-get install -y git

# 3. Install Java 17 (Required to compile and run the Spring Boot backend)
sudo apt-get install -y openjdk-17-jdk

# 4. Install Node.js and npm (Required for the React frontend and Vite dev server)
sudo apt-get install -y nodejs npm

# 5. Install Docker and Docker Compose (Required for the MySQL and NGINX containers)
sudo apt-get install -y docker.io docker-compose-v2

# 6. Add your current user to the Docker group to bypass the 'sudo' requirement
sudo usermod -aG docker $USER

# 7. Apply the new group permissions immediately to the current terminal session
newgrp docker
```

### How to verify the installation

```bash
git --version
java -version
node -v
npm -v
docker --version
docker compose version
```

If you ever need to onboard a new laptop or provision a cloud server for this project, you can simply run this script, clone the repository, and then run `sudo docker compose up -d` to bring the infrastructure online.

## Quick start

If you are starting from a fresh machine, clone the repository first:

```bash
git clone https://github.com/RAM-MAHESHWARI24/TechCompatibility.git
cd TechCompatibility
```

If dependencies were already installed, you do not need to reinstall them. Use three separate terminals for the three services below.

### 1. Start Docker services

Open Terminal 1 and run:

```bash
cd proxy
sudo docker compose up -d
```

This starts:

- `database` — MySQL 8.0
- `reverse-proxy` — Nginx

### 2. Start the backend

Open Terminal 2 and run:

```bash
cd backend
./mvnw clean package
./mvnw spring-boot:run
```

The backend listens on `http://localhost:8080`.

### 3. Start the frontend

Open Terminal 3 and run:

```bash
cd frontend
npm run dev
```

The frontend Vite dev server listens on `http://localhost:5173`.

> You only need to run `npm install` once if packages were not already installed. If the app already has node_modules, you can skip it.

## Verify the setup

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

### Open the app in a browser

- Frontend direct: `http://localhost:5173`
- Through proxy: `http://localhost/`

## Important notes

- `proxy/docker-compose.yml` does not start the backend or frontend apps.
- It only starts MySQL and Nginx.
- You must run the backend and frontend separately.

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