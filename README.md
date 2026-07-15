# Tech Compatibility Project

This project is a modern containerized web application consisting of a React-based frontend and decomposed Node.js/Express microservices. This document provides a comprehensive overview of the microservices architecture, data flow, routing mechanics, database connections, and configurations.

## Architecture Overview

- **Frontend**: A React SPA built with Vite and TypeScript. It uses **React Router DOM** for client-side routing and page transitions.
- **API Gateway**: Integrated into the frontend NGINX server. It proxies requests starting with `/api/auth` to the Auth Service and `/api/lemf` to the LEMF Service.
- **Auth Service**: A Node.js microservice focused on user authentication, login validation, and JWT token issuance. It manages the `auth_db` database.
- **LEMF Service**: A Node.js microservice focused on managing LEMF records (CRUD operations). It manages the `lemf_db` database and cryptographically validates incoming JWT tokens.
- **Database**: A MySQL database instance hosting two separate logical databases: `auth_db` (user credentials) and `lemf_db` (LEMF records).

---

## Architecture and Data Flow: How Calls Are Linked

```
[ User Browser ] ---> [ NGINX / Frontend (Port 8000) ]
                            |
           +----------------+----------------+
           | (/api/auth)                     | (/api/lemf)
           v                                 v
   [ Auth Service ]                   [ LEMF Service ]
     (Port 8081)                        (Port 8082)
           |                                 |
     (uses auth_db)                    (uses lemf_db)
           +----------------+----------------+
                            v
                     [ MySQL (Port 3307) ]
```

### 1. Frontend Routing
The client-side routing no longer uses URL hashes (e.g. `/#display`). It is powered by `react-router-dom` using HTML5 History API (e.g. `/display`, `/create`).
- **Entry Point**: [frontend/src/main.tsx](./frontend/src/main.tsx#L10) wraps the app in `<BrowserRouter>`.
- **Router Layout**: [frontend/src/App.tsx](./frontend/src/App.tsx#L302) defines the `<Routes>` map for `/`, `/display`, `/create`, `/details`, and `/edit`.

### 2. Reverse Proxy and API Routing
In local development with Docker, the NGINX server embedded in the frontend container acts as our primary Gateway on port `8000`.
- **Configuration File**: [frontend/nginx.conf](./frontend/nginx.conf)
- **Routing Rules**:
  - `/api/auth` -> Proxied to `http://auth-service:8080`
  - `/api/lemf` -> Proxied to `http://lemf-service:8080`
  - All other paths (`/`) -> Served statically from built React files (`dist/`).

In Kubernetes deployments, a K8s Ingress Controller acts as the API Gateway:
- **Configuration File**: [k8s/ingress.yaml](./k8s/ingress.yaml)
- Routes traffic on paths `/api/auth` and `/api/lemf` to `auth-service` and `lemf-service` ClusterIP services on port `8080`.

### 3. Database Separation
Rather than a single shared database, each microservice operates on its own logical schema to enforce data isolation:
- **Initialization Script**: [init-scripts/01-databases.sql](./init-scripts/01-databases.sql) creates the logical databases `auth_db` and `lemf_db`.
- **Auth DB**: Contains the `lemf_login_details` table.
- **LEMF DB**: Contains the `lemf_records` table.
- **Cross-Service Constraints**: To maintain database independence, there are no physical foreign key constraints between `lemf_db` and `auth_db`. The `created_by` relationship is maintained purely at the application level.

---

## Passwords, Secrets, and Defaults

1. **Default Database Credentials**
   - **Host (Local Docker Compose)**: `mysql-db:3306` (Exposed to host machine on `3307` for manual CLI/GUI debugging).
   - **User**: `pot_user`
   - **Password**: `pot_pass`
   - **Logical DB Names**: `auth_db` (Auth service) and `lemf_db` (LEMF service).

2. **Admin User Seed Password**
   - **Location**: [auth-service/src/models/authModel.js](./auth-service/src/models/authModel.js#L18)
   - The first time `auth-service` runs, it seeds a default admin user.
   - **Username**: `admin`
   - **Password**: `admin123` (automatically hashed using `bcrypt` during seeding).

3. **JWT Secret Key**
   - Both `auth-service` and `lemf-service` must share the same JWT signature secret to correctly issue and verify login sessions.
   - **Environment Variable**: `JWT_SECRET`
   - **Fallback Value**: `'secretkey123'`

---

## Local Development Execution

You can run the entire containerized microservices stack locally with a single command:
```bash
docker compose up -d
```
Once started, the application will be accessible at:
- **Frontend / Portal**: http://localhost:8000
- **Database (External)**: localhost:3307 (User: `pot_user`, Pass: `pot_pass`)

To view live application logs across the cluster:
```bash
docker compose logs -f
```
