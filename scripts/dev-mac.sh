#!/usr/bin/env bash
#
# Preflight + launch for the CyberMP Freeroam dev server on macOS.
#
# The CyberMP server runtime has no native macOS build, so on a Mac it runs
# inside the Linux Docker image. This script verifies the three things that
# commonly block that path on Apple Silicon before starting the stack:
#   1. the Docker daemon is running
#   2. you are logged in to ghcr.io (the server image is private)
#   3. Rosetta is available to emulate the amd64-only image on arm64 Macs
#
# Non-fatal checks warn and continue; only a stopped Docker daemon aborts.

set -euo pipefail

cd "$(dirname "$0")/.."

red()   { printf '\033[31m%s\033[0m\n' "$1"; }
green() { printf '\033[32m%s\033[0m\n' "$1"; }
yellow(){ printf '\033[33m%s\033[0m\n' "$1"; }

COMPOSE_FILE="docker-compose.dev.yml"
IMAGE="ghcr.io/cyber-mp/server"

echo "CyberMP Freeroam — macOS dev preflight"
echo "--------------------------------------"

# 1. Docker daemon (fatal) ---------------------------------------------------
if ! command -v docker >/dev/null 2>&1; then
  red "✗ Docker is not installed. Install Docker Desktop: https://docker.com/products/docker-desktop"
  exit 1
fi
if ! docker info >/dev/null 2>&1; then
  red "✗ Docker daemon is not running. Start Docker Desktop and retry."
  exit 1
fi
green "✓ Docker daemon is running"

# 2. ghcr.io login (warn) ----------------------------------------------------
docker_config="${DOCKER_CONFIG:-$HOME/.docker}/config.json"
if grep -q '"ghcr.io"' "$docker_config" 2>/dev/null; then
  green "✓ Logged in to ghcr.io"
else
  yellow "⚠ Not logged in to ghcr.io — the server image ($IMAGE) is private."
  yellow "  Run:  docker login ghcr.io    (needs tester access: https://cyber.mp/download)"
fi

# 3. Rosetta on Apple Silicon (warn) ----------------------------------------
if [ "$(uname -m)" = "arm64" ]; then
  if /usr/bin/pgrep -q oahd 2>/dev/null || [ -d /Library/Apple/usr/libexec/oah ]; then
    green "✓ Rosetta is available (amd64 image will run under emulation)"
  else
    yellow "⚠ Rosetta not detected. The server image is linux/amd64 and needs it on Apple Silicon."
    yellow "  Install:  softwareupdate --install-rosetta --agree-to-license"
    yellow "  And enable it in Docker Desktop → Settings → General → 'Use Rosetta for x86/amd64 emulation'."
  fi
else
  green "✓ Intel Mac (amd64) — no emulation needed"
fi

echo "--------------------------------------"
echo "Starting server on :2077 (run 'pnpm run dev:build' in another terminal to build resources)"
echo

exec docker compose -f "$COMPOSE_FILE" up
