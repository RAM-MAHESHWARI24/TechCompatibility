# Frontend React & Vite Package Documentation

This document provides a detailed breakdown of the `package.json` configuration, dependencies, and development tools used in the **frontend** React application.

---

## 🛠️ Project Metadata

| Field | Value | Description |
| :--- | :--- | :--- |
| **Name** | `frontend` | The name of the client-side/frontend application. |
| **Version** | `0.0.0` | Initial version of the project. |
| **Type** | `module` | Tells Node.js to treat JavaScript files as ES Modules, enabling the use of modern `import` / `export` syntax natively. |

---

## ⚡ Scripts

These scripts are defined under the `"scripts"` section of `package.json` to manage development and build processes:

*   **`npm run dev`** (`vite`)
    *   **Why it's used:** Starts the Vite local development server. It is extremely fast, serving modules over native ES modules and leveraging Hot Module Replacement (HMR) for instant browser updates as you save code.
*   **`npm run build`** (`tsc -b && vite build`)
    *   **Why it's used:** Prepares the application for production. It first runs the TypeScript compiler (`tsc -b`) to typecheck all code, and then runs Vite's build tool to compile, bundle, and optimize the React assets into the static `dist/` directory.
*   **`npm run lint`** (`eslint .`)
    *   **Why it's used:** Runs ESLint across the codebase to identify formatting issues, syntax errors, and violations of React best practices or TypeScript rules.
*   **`npm run preview`** (`vite preview`)
    *   **Why it's used:** Runs a lightweight local server to serve the built files from the `dist/` folder. This is used to test/preview the production build locally before actual deployment.

---

## 📦 Production Dependencies (`dependencies`)

These packages make up the core of our user interface and run directly in the user's browser:

### 1. `react` (`^19.2.7`)
*   **What it is:** The core React library.
*   **Why it's used:** Provides component-based architecture, state management hooks (e.g., `useState`, `useEffect`, `useContext`), and the virtual DOM reconciliation engine to build dynamic, efficient user interfaces.

### 2. `react-dom` (`^19.2.7`)
*   **What it is:** The bridge between the React library and the browser's Document Object Model (DOM).
*   **Why it's used:** Responsible for mounting the React component hierarchy onto the target HTML element (`<div id="root"></div>` in `index.html`) and updating the DOM nodes efficiently when the React state changes.

### 3. `react-icons` (`^5.7.0`)
*   **What it is:** A comprehensive library that provides popular icon sets (e.g., FontAwesome, Material Icons, Feather Icons, Ionicons) as React components.
*   **Why it's used:** Makes adding lightweight SVG icons easy and modular. Instead of loading heavy icon font files, we can import specific icons directly as reusable React components.

---

## 🛠️ Development Dependencies (`devDependencies`)

These tools and type definitions are used to maintain code quality, perform typechecking, and handle local building/bundling. They are not bundled into the final production website.

### 🔌 Vite & Build Tools

#### `vite` (`^8.1.1`)
*   **What it is:** A next-generation frontend build tool.
*   **Why it's used:** Powers the entire development workflow. It serves source files instantly via native ES Modules during development (no bundling required to start the server) and uses Rollup behind the scenes for highly optimized production bundling.

#### `@vitejs/plugin-react` (`^6.0.3`)
*   **What it is:** The official Vite plugin for React applications.
*   **Why it's used:** Configures Vite to support React features. Specifically, it enables automatic React JSX transform support, compiles JSX/TSX files using Oxc, and handles Hot Module Replacement (HMR) for components.

---

### 💻 TypeScript Support

#### `typescript` (`~6.0.2`)
*   **What it is:** A strongly typed superset of JavaScript that compiles to plain JavaScript.
*   **Why it's used:** Adds static typechecking to the codebase. It helps catch errors during development (e.g., passing invalid arguments to a function, accessing properties that don't exist) instead of running into runtime exceptions in the browser.

#### `@types/react` (`^19.2.17`) & `@types/react-dom` (`^19.2.3`)
*   **What they are:** Community-maintained TypeScript type definitions for React and React DOM.
*   **Why they are used:** Enable full autocomplete, hover tooltips, and type safety for standard React elements, hooks, and DOM-specific React APIs inside code editors.

#### `@types/node` (`^24.13.2`)
*   **What it is:** TypeScript type definitions for Node.js APIs.
*   **Why it's used:** Provides type declarations for configuration files (like `vite.config.ts` or custom build/utility scripts) that execute in the Node.js runtime.

---

### 🔍 Code Quality & Linting (ESLint)

#### `eslint` (`^10.6.0`)
*   **What it is:** A pluggable linter tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.
*   **Why it's used:** Enforces style guidelines and flags problematic patterns or potential bugs early.

#### `@eslint/js` (`^10.0.1`)
*   **What it is:** The package containing the recommended core configurations and rules from the ESLint team.
*   **Why it's used:** Provides standard baseline linting configurations for JavaScript.

#### `typescript-eslint` (`^8.62.0`)
*   **What it is:** Tooling that enables ESLint to parse, check, and lint TypeScript code.
*   **Why it's used:** Allows ESLint to understand TypeScript syntax and apply advanced type-aware rules to identify potential logical issues in TypeScript code.

#### `eslint-plugin-react-hooks` (`^7.1.1`)
*   **What it is:** An ESLint plugin that checks rule violations for React Hooks.
*   **Why it's used:** Ensures React hooks are used properly (e.g., checking that hooks are called only from React functions and verifying the correct dependencies are specified in dependency arrays for hooks like `useEffect`).

#### `eslint-plugin-react-refresh` (`^0.5.3`)
*   **What it is:** An ESLint plugin to enforce safe hot-reloading components.
*   **Why it's used:** Validates that components are exported correctly so that Vite's React Fast Refresh (HMR) can reload updated components without resetting the state of the entire page.

#### `globals` (`^17.7.0`)
*   **What it is:** A database of global variables across various JS runtimes (browser, node, etc.).
*   **Why it's used:** Configures ESLint so it knows which globals (like `window`, `document`, or `process`) exist in which environment and does not throw linting errors for undefined variables.
