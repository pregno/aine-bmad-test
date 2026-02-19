# Multi-stage Dockerfile for @aine/backend
# Build context MUST be the project root (.) for pnpm monorepo resolution

# ── Base stage ──────────────────────────────────────────────────────
FROM node:20-alpine AS base
RUN npm install -g pnpm@latest
RUN apk add --no-cache curl openssl
WORKDIR /app

# ── Dependencies stage ──────────────────────────────────────────────
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY packages/backend ./packages/backend
RUN pnpm install --frozen-lockfile --filter @aine/backend...
RUN cd packages/backend && npx prisma generate

# ── Development stage ───────────────────────────────────────────────
FROM dependencies AS development
WORKDIR /app/packages/backend
EXPOSE 3000
CMD ["pnpm", "run", "dev"]

# ── Build stage ─────────────────────────────────────────────────────
FROM dependencies AS build
# Story 1.1 keeps noEmit=true; override for container build output until Story 1.3 adjusts backend build config.
RUN pnpm exec tsc -p packages/backend/tsconfig.json --noEmit false

# ── Production stage ────────────────────────────────────────────────
FROM base AS production
COPY --from=build /app/packages/backend/dist ./packages/backend/dist
COPY --from=build /app/packages/backend/prisma ./packages/backend/prisma
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/backend/package.json ./packages/backend/package.json
COPY --from=build /app/package.json ./package.json
WORKDIR /app/packages/backend
EXPOSE 3000
CMD ["node", "dist/index.js"]

# ── Test stage ──────────────────────────────────────────────────────
FROM dependencies AS test
WORKDIR /app/packages/backend
ENV NODE_ENV=test
CMD ["pnpm", "run", "test"]
