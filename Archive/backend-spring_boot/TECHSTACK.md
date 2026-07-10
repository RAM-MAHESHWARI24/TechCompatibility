# Technology Stack and Purpose

This repository is a simple full-stack demo that uses a combination of backend, frontend, and proxy technologies.

## Backend

- **Java 17**
  - Language used for the backend service.
  - Provides strong typing, mature ecosystem, and compatibility with Spring Boot.

- **Spring Boot**
  - Framework for building Java web applications and REST APIs.
  - Simplifies project setup, dependency management, and server configuration.
  - In this repo, it provides the backend API at `http://localhost:8080/api`.

- **Maven**
  - Build and dependency management tool for Java.
  - The project uses `pom.xml` to define dependencies, build lifecycle, and plugins.
  - Includes the Spring Boot Maven plugin for running and packaging the app.

- **Spring Data JPA**
  - Simplifies database access and mapping between Java objects and relational data.
  - The backend can use JDBC and JPA to connect to MySQL.

- **MySQL**
  - Relational database used by the backend.
  - The repository configures database access in `backend/src/main/resources/application.properties`.

## Frontend

- **React**
  - JavaScript library for building user interfaces.
  - Provides a component-based structure for building the app UI.

- **TypeScript**
  - Typed superset of JavaScript that improves code safety and developer experience.
  - Used to define React components and app logic with type annotations.

- **Vite**
  - Frontend build tool and dev server.
  - Provides fast startup, hot module replacement, and modern frontend tooling.
  - The frontend app runs on `http://localhost:5173` by default.

- **ESLint**
  - Linting tool to enforce code quality and catch common bugs in JavaScript/TypeScript.
  - Helps keep frontend code consistent and maintainable.

## Proxy / Infrastructure

- **Docker Compose**
  - Orchestrates the database and proxy containers.
  - The file `proxy/docker-compose.yml` starts:
    - `database` — MySQL container
    - `reverse-proxy` — Nginx container

- **Nginx**
  - Web server and reverse proxy.
  - Configured in `proxy/default.conf` to route requests:
    - `/` → frontend dev server on `localhost:5173`
    - `/api/` → backend on `localhost:8080`
  - Also supports WebSocket upgrade headers needed by Vite HMR.

- **host.docker.internal**
  - Used inside Docker to let the proxy container reach services running on the host machine.
  - This enables the proxy to forward requests to the local backend and frontend dev servers.

## What each folder contains

- `backend/`
  - Java Spring Boot application code and Maven configuration.
  - Backend API endpoint: `/api/check`.
  - Database settings for MySQL.

- `frontend/`
  - React + TypeScript application.
  - Vite config and frontend dependencies.
  - Static and source assets for the UI.

- `proxy/`
  - Docker Compose file for infrastructure services.
  - Nginx reverse proxy configuration.

## How the parts work together

1. `docker compose up -d` in `proxy/` starts the MySQL and Nginx containers.
2. Run the backend separately via Maven.
3. Run the frontend separately via Vite.
4. Nginx forwards browser requests to the correct service:
   - Browser root to frontend
   - `/api/` to backend

## Why this stack was chosen

- Easy separation of concerns: backend, frontend, and infrastructure are each isolated.
- Common modern web stack: React for UI, Spring Boot for API, Docker for local infrastructure.
- Good developer workflow: Vite for fast frontend development and Nginx to simulate a production-like proxy.

## Notes

- The current setup is not yet a single-step Docker deployment for the entire app.
- The backend and frontend still need to be started separately in development.
- Adding Dockerfiles and a unified root Compose file would make the current architecture easier to run end-to-end.
