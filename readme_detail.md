# Detailed Architectural Readme

This document provides a highly detailed, line-by-line trace of the core workflows in the Tech Compatibility Project. It maps out exactly how the frontend UI triggers state changes, how those requests flow through the Express backend to the database, and how sensitive data like passwords are encrypted and verified.

---

## 1. Frontend Component & Logging Flow

The React frontend utilizes a central state component, `App.tsx`, which serves as the router and primary data store.

### Global Interceptors
Before the UI even mounts, the global logging interceptor is invoked:
- **Initialization**: [main.tsx](./frontend/src/main.tsx#L1) imports `./utils/logger` at the very top.
- **Log Trapper**: [logger.ts](./frontend/src/utils/logger.ts#L45-L59) overrides `console.log`, `console.warn`, and `console.error`.
- **Backend Transport**: When a log is caught, it formats the arguments and triggers an asynchronous `fetch('/api/logs')` ([logger.ts](./frontend/src/utils/logger.ts#L30-L36)).
- **Backend Logging Engine**: The backend Express server catches this on the route defined at [app.js](./backend-node/src/app.js#L25-L39). It prepends `[Front-End]` to the payload ([app.js](./backend-node/src/app.js#L28)) and invokes its native console, which is in turn intercepted by [backend-node/src/config/logger.js](./backend-node/src/config/logger.js) to write directly into `logs/app.log`.

### UI Routing
- The current page view is determined by the `activePage` state inside [App.tsx](./frontend/src/App.tsx#L22).
- URL Hash changes (e.g., `#home`, `#login`) are tracked by a `hashchange` event listener on `window` ([App.tsx](./frontend/src/App.tsx#L70-L86)).

---

## 2. Authentication & Password Encryption Flow

Passwords are **never** stored in plain text. The application utilizes `bcryptjs` with salt rounds to securely hash credentials.

### 2.1 Password Initialization (The "Seed")
When the Node.js backend starts, it ensures the database is correctly constructed.
- **Schema Initialization**: `server.js` calls `LemfModel.initializeTable()`.
- **Admin Seeding**: Inside [lemfModel.js](./backend-node/src/models/lemfModel.js#L54-L62), it checks if the `lemf_login_details` table is empty. If it is, it hashes the string `'admin123'` using `bcrypt.hash('admin123', 10)` ([lemfModel.js](./backend-node/src/models/lemfModel.js#L56)).
- It inserts the username `admin` and the generated hash string (starting with `$2a$10$...`) directly into the table.

### 2.2 Login Call Flow
1. **User Action**: The user enters their username and password into the inputs defined in [login.tsx](./frontend/src/Pages/login.tsx#L42-L96) and submits the form.
2. **Frontend Handler**: The submit triggers `handleSubmit` ([login.tsx](./frontend/src/Pages/login.tsx#L15)), which calls the `onLogin` prop. This prop maps directly to the `handleLogin` function in [App.tsx](./frontend/src/App.tsx#L88).
3. **API Dispatch**: `handleLogin` executes `fetch('/api/auth/login')` with a JSON payload of the credentials ([App.tsx](./frontend/src/App.tsx#L90-L94)).
4. **Backend Router**: The proxy sends this to Express. [app.js](./backend-node/src/app.js#L5) mounts `/api/auth` to `authRoutes.js`. [authRoutes.js](./backend-node/src/routes/authRoutes.js#L5) maps the `/login` POST request directly to the `login` function in the Auth Controller.
5. **Controller Verification**: 
   - [authController.js](./backend-node/src/controllers/authController.js#L7-L44) executes.
   - It retrieves the user's hashed password from MySQL via [AuthModel.findByUsername](./backend-node/src/models/authModel.js#L4-L8).
   - **Encryption Check**: It securely compares the plain-text password from the HTTP body against the hashed DB password using `await bcrypt.compare(password, user.password)` ([authController.js](./backend-node/src/controllers/authController.js#L18)).
6. **Token Generation**: If the password matches, the controller signs a JSON Web Token (JWT) using the `JWT_SECRET` (fallback `'secretkey123'`) at [authController.js](./backend-node/src/controllers/authController.js#L24-L28).
7. **Frontend Resolution**: The frontend receives the JWT, sets `isLoggedIn` to `true`, and stores the token in `localStorage`.

---

## 3. LEMF Record Data Flow

Once authenticated, the user will request the table of LEMF records.

1. **Triggering the Fetch**: The `useEffect` hook in [App.tsx](./frontend/src/App.tsx#L80-L82) detects that `isLoggedIn` is true and executes `loadRows()`.
2. **Frontend Dispatch**: `loadRows()` ([App.tsx](./frontend/src/App.tsx#L50-L68)) sends a GET request to `/api/lemf`, injecting the JWT Token into the `Authorization: Bearer <token>` header.
3. **Backend Routing**: 
   - [app.js](./backend-node/src/app.js#L4) links `/api/lemf` to [lemfRoutes.js](./backend-node/src/routes/lemfRoutes.js).
   - The route `GET /` is routed to `lemfController.list` in [lemfRoutes.js](./backend-node/src/routes/lemfRoutes.js#L5).
4. **Data Retrieval**:
   - `lemfController.list` ([lemfController.js](./backend-node/src/controllers/lemfController.js#L3-L12)) logs the action and asks the Model for data via `LemfModel.findAll()`.
   - `LemfModel.findAll()` ([lemfModel.js](./backend-node/src/models/lemfModel.js#L84-L88)) issues the raw SQL query `SELECT * FROM lemf_records ORDER BY id DESC`.
   - It utilizes the MySQL connection pool initialized in [config/db.js](./backend-node/src/config/db.js#L35).
5. **Formatting and Returning**: The Model maps the raw SQL rows to cleaner Data Transfer Objects via `mapRowToDto` ([lemfModel.js](./backend-node/src/models/lemfModel.js#L5-L16)). The controller wraps the array in JSON and sends it back to the client.
6. **Frontend Render**: [App.tsx](./frontend/src/App.tsx#L64) updates the `rows` state variable, which causes [display_lemf.tsx](./frontend/src/Pages/display_lemf.tsx) to re-render, displaying the newly fetched rows in the table UI.
