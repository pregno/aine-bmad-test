# aine-bmad-test

A mobile-first task management web application for rapid task capture during meetings.

## Quick Start

### Prerequisites

- [pnpm](https://pnpm.io/) v8+ (`npm install -g pnpm`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Node.js 20+

### Install dependencies

```bash
pnpm install
```

### Run in development (Docker)

```bash
docker compose --profile local up -d
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Run locally (hybrid — database in Docker, services local)

```bash
# Start database only
docker compose up database -d

# In separate terminals:
pnpm --filter backend dev
pnpm --filter frontend dev
```

## Workspace Scripts

| Command | Description |
|---|---|
| `pnpm install` | Install all workspace dependencies |
| `pnpm dev` | Start frontend + backend in dev mode (local) |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests across all packages |
| `pnpm lint` | Lint all packages |
| `pnpm type-check` | TypeScript check all packages |
| `pnpm format` | Format all files with Prettier |

## Project Structure

```
aine-bmad-test/
├── packages/
│   ├── frontend/     # React + Vite + Material-UI
│   ├── backend/      # Fastify + Prisma + PostgreSQL
│   └── shared/       # @aine/shared — shared TypeScript types
├── docker-compose.yml
├── tsconfig.base.json
├── .eslintrc.js
└── .prettierrc.js
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Material-UI v5, TanStack Query v5
- **Backend**: Fastify 4, TypeScript, Prisma 5, PostgreSQL 16, Zod
- **Shared**: `@aine/shared` — type-safe API contracts
- **Testing**: Vitest (unit/integration), Playwright (E2E), Testcontainers
- **DevOps**: Docker Compose with profiles (local/test/prod)
