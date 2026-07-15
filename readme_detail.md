# Detailed Architectural Readme

This document provides a detailed trace of core workflows, component execution paths, and security processes in the decomposed Tech Compatibility Project.

---

## 1. Frontend & Routing Architecture

The client-side application runs as a Single Page Application (SPA) compiled under Vite.

### Global Interceptors & Logging
1. **logger.ts import**: [main.tsx](./frontend/src/main.tsx#L2) imports `./utils/logger` at the top of the bundle entry.
2. **Overrides**: [logger.ts](./frontend/src/utils/logger.ts) replaces standard console logging methods (`console.log`, `console.warn`, `console.error`) with custom hooks.
3. **Transport**: When console messages occur, they are intercepted and forwarded via an asynchronous `POST /api/logs` request back to the server gateway.
4. **Proxy**: The frontend NGINX server catches `/api/logs` (served on port `8000`) and passes them back to console output.

### Client Routing (React Router DOM)
- The application uses `react-router-dom`'s HTML5 History API rather than standard URL hashes (e.g. `/#display`).
- **Setup**: [main.tsx](./frontend/src/main.tsx#L10) mounts the root component inside `<BrowserRouter>`.
- **Navigation Action**: The `navigateTo` function in [App.tsx](./frontend/src/App.tsx#L32) acts as a mapping wrapper around `react-router-dom`'s `useNavigate()` hook. It maps string aliases like `'home'` to `/` and `'display'` to `/display`.
- **Views**: The main panel uses `<Routes>` to switch components dynamically without full page reloads:
  - Path `/` renders [home.tsx](./frontend/src/Pages/home.tsx).
  - Path `/display` renders [display_lemf.tsx](./frontend/src/Pages/display_lemf.tsx).
  - Path `/create` renders [create_lemf.tsx](./frontend/src/Pages/create_lemf.tsx).
  - Path `/details` renders [details.tsx](./frontend/src/Pages/details.tsx).
  - Path `/edit` renders [edit_lemf.tsx](./frontend/src/Pages/edit_lemf.tsx).

---

## 2. Authentication & Data Seeding

Database credentials and user details are managed entirely in the isolated `auth-service` database (`auth_db`).

### 2.1 Admin Seeding & Initialization
1. **Startup**: When the `auth-service` container starts, `server.js` triggers `AuthModel.initializeTable()` ([auth-service/src/server.js](./auth-service/src/server.js#L11)).
2. **Schema Creation**: Inside [authModel.js](./auth-service/src/models/authModel.js#L5), it creates the `lemf_login_details` table if it doesn't already exist.
3. **Admin User Generation**: It checks if there are any records in `lemf_login_details`. If empty, it securely hashes the default admin password `'admin123'` using `bcrypt.hash('admin123', 10)` and seeds the default `admin` credentials ([authModel.js](./auth-service/src/models/authModel.js#L20)).

### 2.2 Login and Verification Flow
1. **Input Submission**: The user submits their login details via the form in [login.tsx](./frontend/src/Pages/login.tsx).
2. **Callback to App**: Submission fires the `onLogin` callback, routing to `handleLogin` in [App.tsx](./frontend/src/App.tsx#L88).
3. **API Dispatch**: `handleLogin` makes a POST request to `/api/auth/login` containing the username and password payload.
4. **NGINX Proxy**: The request reaches the frontend gateway. NGINX matches the `/api/auth` prefix and routes the request to the `auth-service` container on port `8080` ([frontend/nginx.conf](./frontend/nginx.conf#L4)).
5. **Auth Route Processing**: The Express framework in `auth-service` maps the request to `authController.login` ([auth-service/src/routes/authRoutes.js](./auth-service/src/routes/authRoutes.js)).
6. **Bcrypt Verification**:
   - `authController.login` queries the user record using `AuthModel.findByUsername`.
   - The controller executes `await bcrypt.compare(password, user.password)` to secure-match the plaintext login attempt with the hashed password from the database.
7. **JWT Token Signing**: If verification succeeds, a JWT payload containing the user's ID and username is signed using `JWT_SECRET` (defaults to `'secretkey123'`).
8. **Client Storage**: The signed JWT token is sent back to the frontend, where it is saved in the browser's `localStorage` and used as a header in subsequent API requests.

---

## 3. LEMF Record Data Flow

All LEMF records are stored in the isolated `lemf-service` database (`lemf_db`).

### 3.1 Authenticated API Request
1. **Trigger**: When the client navigates to the `/display` route, the application fires `loadRows()` in [App.tsx](./frontend/src/App.tsx#L50).
2. **Token Injected**: `loadRows()` fetches from `/api/lemf`. It appends the cached JWT from `localStorage` as a `Bearer` token in the `Authorization` header.
3. **Gateway Routing**: The NGINX proxy captures the request on port `8000` and forwards `/api/lemf` to the `lemf-service` container on port `8080`.

### 3.2 Token Validation & DB Fetching
1. **Middleware Check**: Before reaching the route handler, the request passes through the auth middleware ([lemf-service/src/middlewares/authMiddleware.js](./lemf-service/src/middlewares/authMiddleware.js#L4)).
2. **Decryption & Authorize**: The middleware extracts the bearer token and executes `jwt.verify(token, JWT_SECRET)`. If the token is valid, it attaches the decoded user data to `req.user` and calls `next()`. If invalid or missing, it blocks the request with a `401 Unauthorized` status.
3. **Controller Execution**: The authorized request is routed to `lemfController.list` in [lemfRoutes.js](./lemf-service/src/routes/lemfRoutes.js).
4. **SQL Query**: The controller calls `LemfModel.findAll()`, which uses the MySQL pool connection to query the data:
   ```sql
   SELECT * FROM lemf_records ORDER BY id DESC;
   ```
5. **Data Hydration**: [lemfModel.js](./lemf-service/src/models/lemfModel.js#L5) maps the raw MySQL row columns to cleaner JavaScript camelCase DTOs via `mapRowToDto`.
6. **Rendering**: The hydrated JSON payload is returned to the client. The frontend updates the `rows` state variable in [App.tsx](./frontend/src/App.tsx#L23), which triggers a visual re-render of [display_lemf.tsx](./frontend/src/Pages/display_lemf.tsx) displaying the record table.
