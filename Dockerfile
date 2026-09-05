FROM node:22-slim AS builder

# Install pnpm
RUN npm install -g pnpm
RUN apt-get update && apt-get install -y --no-install-recommends libatomic1 \ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN pnpm i --frozen-lockfile --ignore-scripts
RUN pnpm -r build

FROM ghcr.io/cyber-mp/server:latest

WORKDIR /cybermp

COPY --from=builder /app/resources /cybermp/resources
COPY --from=builder /app/server.toml /cybermp/server.toml
