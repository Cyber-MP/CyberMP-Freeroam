FROM node:22-slim AS builder

RUN corepack enable

WORKDIR /app
COPY . .

ENV CI=true
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm -r build

# RUN pnpm prune --ignore-scripts --prod

FROM ghcr.io/cyber-mp/server:latest

WORKDIR /cybermp

COPY --from=builder /app/node_modules /cybermp/node_modules
COPY --from=builder /app/resources /cybermp/resources
COPY --from=builder /app/libs /cybermp/libs
COPY --from=builder /app/server.toml /cybermp/server.toml
