# Backend Node.js Package Documentation

This document provides a detailed breakdown of the `package.json` configuration, dependencies, and development tools used in the **backend-node** service.

---

## 🛠️ Project Metadata

| Field | Value | Description |
| :--- | :--- | :--- |
| **Name** | `backend-node` | The official name of this service. |
| **Version** | `1.0.0` | The current semantic version of the backend project. |
| **Description** | `Node.js MVC Backend for Tech Compatibility Demo` | A short description explaining the purpose of this service. |
| **Main Entry** | `src/server.js` | The entry point file where the Node.js application starts. |
| **Module Type** | `commonjs` | Specifies that the project uses CommonJS modules (`require` / `module.exports`). |

---

## ⚡ Scripts

These scripts are defined under the `"scripts"` section of `package.json` to automate tasks:

*   **`npm run start`** (`node src/server.js`)
    *   **Why it's used:** Used in production environments to run the application using the standard Node.js runtime. It does not auto-restart on changes.
*   **`npm run dev`** (`nodemon src/server.js`)
    *   **Why it's used:** Used during active local development. It launches the application with `nodemon` to watch files and auto-restart the server on code changes.

---

## 📦 Production Dependencies (`dependencies`)

These packages are required for the application to run successfully in a production environment:

### 1. `express` (`^4.19.2`)
*   **What it is:** A fast, unopinionated, minimalist web framework for Node.js.
*   **Why it's used:** It acts as the backbone of our backend API. It manages routes (endpoints), handles incoming HTTP requests, processes middleware (like body parsing, CORS, authentication), and sends back JSON responses.

### 2. `mysql2` (`^3.9.7`)
*   **What it is:** A MySQL client library for Node.js.
*   **Why it's used:** Enables the backend to connect to a MySQL database and execute SQL queries. It supports modern JavaScript features like Promises (async/await) and Prepared Statements, which improve security against SQL injection attacks.

### 3. `dotenv` (`^16.4.5`)
*   **What it is:** A zero-dependency module that loads environment variables from a `.env` file into Node's `process.env`.
*   **Why it's used:** Kept for security and configuration flexibility. It ensures secrets (like database credentials, JWT keys, and port numbers) are not hardcoded into the source control but are injected dynamically at runtime.

### 4. `bcryptjs` (`^3.0.3`)
*   **What it is:** A pure JavaScript implementation of the bcrypt password hashing algorithm.
*   **Why it's used:** Secures user passwords. Before saving a user password to the database, we hash it using bcrypt to ensure that even if the database is compromised, the actual passwords remain safe. Being written in pure JS, it doesn't require native C++ compiler tools during installation.

### 5. `jsonwebtoken` (`^9.0.2`)
*   **What it is:** An implementation of JSON Web Tokens (JWT) for authentication.
*   **Why it's used:** Used for session-less/stateless user authentication. When a user logs in, the backend signs a token containing non-sensitive details. The frontend sends this token in subsequent API requests, which the backend verifies to authenticate the user.

### 6. `cors` (`^2.8.5`)
*   **What it is:** An Express middleware to enable Cross-Origin Resource Sharing.
*   **Why it's used:** Allows our React frontend (running on a different origin/port like `http://localhost:5173`) to safely make API requests to the Express server (running on `http://localhost:5000` or another port). Without it, the browser would block the requests due to security policies.

---

## 🛠️ Development Dependencies (`devDependencies`)

These packages are only needed during local development and testing, and are excluded from the production build:

### 1. `nodemon` (`^3.1.0`)
*   **What it is:** A command-line utility that monitors files for changes in your directory and automatically restarts your node application.
*   **Why it's used:** Boosts developer productivity. Instead of manually stopping and restarting the server every time a file is modified, `nodemon` watches the files and restarts the server instantly.
