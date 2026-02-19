# Multi-stage Dockerfile for @aine/frontend
# Build context MUST be the project root (.) for pnpm monorepo resolution

# ── Base stage ──────────────────────────────────────────────────────
FROM node:20-alpine AS base
RUN npm install -g pnpm@latest
WORKDIR /app

# ── Dependencies stage ──────────────────────────────────────────────
# Copy full package sources first (node_modules excluded by .dockerignore),
# then install so node_modules are created in the right place and not overwritten
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY packages/frontend ./packages/frontend
RUN pnpm install --frozen-lockfile --filter @aine/frontend...

# ── Development stage ───────────────────────────────────────────────
FROM dependencies AS development
WORKDIR /app/packages/frontend
EXPOSE 5173
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0"]

# ── Build stage ─────────────────────────────────────────────────────
FROM dependencies AS build
WORKDIR /app/packages/frontend
RUN pnpm run build

# ── Production stage ────────────────────────────────────────────────
FROM nginx:alpine AS production
COPY --from=build /app/packages/frontend/dist /usr/share/nginx/html
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# ── Test stage ──────────────────────────────────────────────────────
FROM dependencies AS test
WORKDIR /app/packages/frontend
ENV NODE_ENV=test
CMD ["pnpm", "run", "test"]
