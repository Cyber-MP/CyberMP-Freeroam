# 🌐 CyberMP Freeroam

Welcome to **CyberMP Freeroam**, an official open-source multiplayer gamemode built for the CyberMP platform. This project is structured as a high-performance, TypeScript-driven **pnpm monorepo**.

## 🚀 Features & Architecture

- **Monorepo Workflow:** Powered by `pnpm` workspaces for multi-package management.
- **InversifyJS Dependency Injection:** Modular, and maintainable enterprise-grade architecture across Client and Server logic.
- **React & TanStack Router Browser UI:** High-fidelity, reactive in-game interfaces.
- **Built-in Hotreloading:** Quick iteration workflow using a dedicated hotreload resource module.
- **Cross-Platform Support:** Ready to run natively on Windows, Linux, or inside Docker containers.
- **Modern Tooling:** Code quality enforced by [Biome](https://biomejs.dev/) (linting/formatting) and TypeScript type checks.

---

## 🛠️ Prerequisites

Ensure you have the following installed before proceeding:
- **Node.js** (v22+ recommended)
- **pnpm** `^11.8.0`
- **Docker & Docker Compose** *(Optional, for containerized environments)*

---

## ⚙️ Getting Started

### 1. Installation
Clone the repository and install dependencies at the root level:
```bash
pnpm install
```

### 2. Create .env file
Copy `.env.example` file and rename it to `.env` and fill the required values

### 3. Running the Development Server
To launch the development server, you need to open **two terminal windows**:

#### **Terminal 1: Build & Watch Resources**
Compiles all workspace packages (`@freeroam/*`) in watch/parallel mode:
```bash
pnpm run dev:build
```

#### **Terminal 2: Launch CyberMP Server Executable**
Depending on your host operating system, run one of the following commands:
- **Windows:**
  ```bash
  pnpm run dev:win
  ```
- **Linux:**
  ```bash
  pnpm run dev:linux
  ```

---

## 🐳 Running with Docker

Alternatively, you can run the entire stack within isolated Docker containers:

- **Development Mode:**
  ```bash
  pnpm run dev:docker
  ```
- **Production Mode:**
  ```bash
  pnpm run docker
  ```

---

## 📂 Project Structure

```text
.
├── libs/                  # Shared libraries across environments
│   ├── inversify/         # Custom Inversify dependency injection wrappers
│   └── shared/            # Shared logic (game-modes, matchmaking, types)
├── mp/                    # CyberMP Native Server Binaries
│   ├── linux/             # Linux executable
│   └── win/               # Windows executable (.exe)
├── resources/             # Active game resources
│   ├── freeroam/          # Primary Freeroam Gamemode
│   │   ├── assets/        # Visual and environment mapping archives (e.g., de_dust2)
│   │   ├── browser/       # React user interface app (TanStack Router)
│   │   ├── client/        # Game-client TypeScript side (Inversify)
│   │   └── server/        # Game-server TypeScript side (Inversify)
│   └── hotreload/
└── server.toml            # Primary CyberMP configuration
```

---

## 📡 Communication & RPC

All communication across **Browser ↔ Client ↔ Server** is strictly schema-driven and handled via the [official RPC framework](https://github.com/cyber-mp/cybermp-rpc).
---

### Git Hooks
The repository includes automated pre-commit and pre-push validation powered by `simple-git-hooks`. It triggers type checks automatically to prevent breaking changes from hitting the repository.

---
Made by [terminaate](https://github.com/terminaate) with bare hands (except for README.md, it was done using gemini💀)
