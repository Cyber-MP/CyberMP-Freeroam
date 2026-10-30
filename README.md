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

> **macOS:** there is no native macOS build of the CyberMP server runtime — run it via
> Docker instead (see [Running on macOS](#-running-on-macos) below).

---

## 🍎 Running on macOS

The CyberMP server runtime is distributed for **Windows and Linux only**, so on macOS the
server runs inside the **Linux Docker image** rather than as a native binary. The gamemode
code itself is fully cross-platform.

**Prerequisites (in addition to the ones above):**
- **Docker Desktop** running.
- **Rosetta enabled** in Docker Desktop (*Settings → General → "Use Rosetta for x86/amd64
  emulation on Apple Silicon"*). The server image is `linux/amd64`; the dev compose file
  pins `platform: linux/amd64` so it runs under Rosetta on Apple Silicon Macs.
- **Access to the private server image.** Authenticate first so Docker can pull it:
  ```bash
  docker login ghcr.io
  ```
  (Image access is granted to testers — see https://cyber.mp/download.)

**Run it** using two terminal windows, same as the native flow:

```bash
# Terminal 1: build & watch the @freeroam/* resources
pnpm run dev:build

# Terminal 2: launch the server in Docker
pnpm run dev:mac
```

The server listens on **port 2077** (TCP + UDP); clients connect to `<your-ip>:2077`.
`pnpm run dev:mac` runs `scripts/dev-mac.sh`, which preflight-checks the Docker daemon,
`ghcr.io` login, and Rosetta before starting the dev compose stack — then launches it.

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

> The production/base compose files read an `.env` file. Make sure it exists first
> (`cp .env.example .env`) before running `pnpm run docker`.

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
