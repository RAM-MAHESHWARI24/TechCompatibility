# Tech Compatibility Project

This project is a modern web application consisting of a React-based frontend and a Node.js/Express backend. This document provides a comprehensive overview of the architecture, data flow, database connection setup, and configuration details.

## Brief Overview

- **Frontend**: A React application built using Vite, written in TypeScript. It handles the user interface, authentication state, and renders dynamic views (Home, Display LEMF, Create LEMF, etc.).
- **Backend**: A Node.js application using Express for routing and `mysql2` for database interaction. It exposes RESTful APIs for authentication, retrieving records, and logging.
- **Database**: MySQL database holding records (`lemf_records`) and user login details (`lemf_login_details`).

---

## Architecture and Data Flow: How Calls Are Linked

The frontend and backend are deeply integrated but run as separate processes during development.

### 1. Frontend Proxying
All API calls from the frontend (e.g., `fetch('/api/lemf')`) are intercepted by Vite's development server. 
- **Configuration File**: [frontend/vite.config.ts](./frontend/vite.config.ts#L10-L15)
- **Target**: Calls starting with `/api` are automatically proxied to the backend server at `http://localhost:8080`.

### 2. Request Handling on Backend
When a request hits `http://localhost:8080`, it enters the Express application.
- **Entry Point**: [backend-node/src/app.js](./backend-node/src/app.js#L23-L25)
- The app binds specific route prefixes to distinct router files:
  - `/api/auth` is routed to [backend-node/src/routes/authRoutes.js](./backend-node/src/routes/authRoutes.js)
  - `/api/lemf` is routed to [backend-node/src/routes/lemfRoutes.js](./backend-node/src/routes/lemfRoutes.js)

### 3. Controllers and Models
The routers direct the incoming requests to specific controller methods.
- **Example Flow**: `POST /api/auth/login` hits [authController.login](./backend-node/src/controllers/authController.js#L7). 
- The controller then calls the corresponding Model (e.g., [AuthModel.findByUsername](./backend-node/src/models/authModel.js#L4)) which runs the raw SQL queries against the database pool.

### 4. Custom Log Forwarding
Frontend `console` output (logs, warnings, errors) are intercepted and sent to the backend.
- **Frontend Interceptor**: [frontend/src/utils/logger.ts](./frontend/src/utils/logger.ts#L8) captures logs and issues a `POST /api/logs`.
- **Backend Handler**: The route is directly defined in [backend-node/src/app.js](./backend-node/src/app.js#L21-L35). The backend formats the message with a `[frontEnd]` prefix and appends it to `logs/app.log` via the global override defined in [backend-node/src/config/logger.js](./backend-node/src/config/logger.js).

### 5. NGINX Gateway Configuration (Docker/Global)
If the application is run via Docker (or using a global NGINX service on Linux), NGINX acts as the primary reverse proxy and entry point.
- **Docker Compose Setup**: NGINX is declared as a service `pot-nginx` in [proxy/docker-compose.yml](./proxy/docker-compose.yml#L63-L75).
- **Configuration File**: The routing configuration is loaded from [proxy/default.conf](./proxy/default.conf) (or `/etc/nginx/sites-enabled/default` globally).
- **Routing Rules**: 
  - Root traffic (`/`) on port `80` is proxied to the Vite frontend server on port `5173`.
  - API traffic (`/api/`) on port `80` is proxied directly to the Express backend on port `8080`.

---

## Database Connection and Configuration

The backend connects to a MySQL database using a connection pool created by the `mysql2` package.

### Connection Setup
- **File**: [backend-node/src/config/db.js](./backend-node/src/config/db.js)
- The application attempts to load credentials from `.env` (using `dotenv`).
- It supports parsing a JDBC URL (`SPRING_DATASOURCE_URL`) or falling back to standard `DB_HOST`, `DB_USER`, `DB_PASSWORD` variables.

### Database Initialization
- **Initialization Script**: The database schema is automatically initialized if the tables don't exist.
- **Location**: [backend-node/src/models/lemfModel.js](./backend-node/src/models/lemfModel.js#L18)
- During startup in `server.js`, it calls `LemfModel.initializeTable()` to create `lemf_records` and `lemf_login_details`.

---

## Passwords, Secrets, and Defaults

Below is a detailed breakdown of where default passwords and secrets are stored in the codebase:

1. **Default Database Credentials**
   - **Location**: [backend-node/src/config/db.js](./backend-node/src/config/db.js#L25-L27)
   - **User Default**: `pot_user`
   - **Password Default**: `pot_pass`
   - **Database Name Default**: `pot_db`
   - **Host Default**: `localhost:3306`

2. **Admin User Seed Password**
   - **Location**: [backend-node/src/models/lemfModel.js](./backend-node/src/models/lemfModel.js#L56)
   - When the `lemf_login_details` table is created, the system seeds a default admin user.
   - **Username**: `admin`
   - **Password**: `admin123` (this is automatically hashed using `bcrypt` before insertion).

3. **JWT Secret Key**
   - **Location**: [backend-node/src/controllers/authController.js](./backend-node/src/controllers/authController.js#L5)
   - Used to cryptographically sign the session tokens upon successful login.
   - **Fallback Value**: `'secretkey123'`

*Note: For production deployments, ensure all environment variables are properly set to override these defaults.*
