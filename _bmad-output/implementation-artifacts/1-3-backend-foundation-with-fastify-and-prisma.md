# Story 1.3: Backend Foundation with Fastify and Prisma

Status: ready-for-dev

## Story

As a developer,
I want a Fastify backend with Prisma ORM, Pino logging, and initial database schema,
so that I can build REST API endpoints with type-safe database access.

## Acceptance Criteria

**AC1 — Fastify server starts with Pino logging and health check**
- **Given** the backend package structure exists
- **When** I run `pnpm --filter backend dev`
- **Then** the Fastify server starts on port 3000 with Pino logger configured (pretty-print in development, JSON in production)
- **And** the server responds to health check at `GET /health` with status 200
- **And** CORS is configured to accept requests from `http://localhost:5173`

**AC2 — Prisma migration creates the tasks table**
- **Given** the Prisma schema is defined
- **When** I run `pnpm --filter backend prisma migrate dev`
- **Then** a PostgreSQL migration creates the `tasks` table with columns: `id` (UUID primary key), `text` (VARCHAR 500), `status` (ENUM 'ACTIVE'/'COMPLETED'), `createdAt` (TIMESTAMP), `completedAt` (TIMESTAMP nullable)
- **And** a composite index is created on `(status, createdAt)` for optimized sorting

**AC3 — Prisma client provides type-safe access**
- **Given** the Prisma client is generated
- **When** I import `@prisma/client` in backend code
- **Then** TypeScript autocomplete provides type-safe access to the `task` model
- **And** I can execute queries like `prisma.task.findMany()` with full type safety

**AC4 — Hot reload works with tsx watch**
- **Given** hot reload is enabled in local development
- **When** I modify a TypeScript file in `packages/backend/src`
- **Then** the server restarts automatically within 2 seconds via `tsx watch`
- **And** Pino logs indicate the restart

## Tasks / Subtasks

- [ ] Task 1: Create environment validation with Zod (AC1)
  - [ ] Create `packages/backend/src/config/env.ts` with Zod schema validating `NODE_ENV`, `PORT`, `DATABASE_URL`, `LOG_LEVEL`, `FRONTEND_URL`
  - [ ] Validate env on server startup, exit with clear error message on invalid config

- [ ] Task 2: Create Pino logger utility (AC1)
  - [ ] Create `packages/backend/src/utils/logger.ts` with Pino
  - [ ] Configure pretty-print transport for development (when `NODE_ENV=development`)
  - [ ] Configure raw JSON output for production
  - [ ] Use `LOG_LEVEL` from env (default: `info`)

- [ ] Task 3: Create Prisma plugin for Fastify (AC1, AC3)
  - [ ] Create `packages/backend/src/plugins/prisma.ts` as a Fastify plugin
  - [ ] Initialize PrismaClient, decorate Fastify instance with `prisma`
  - [ ] Handle graceful shutdown (`prisma.$disconnect` on `onClose` hook)

- [ ] Task 4: Create centralized error handler (AC1)
  - [ ] Create `packages/backend/src/utils/errorHandler.ts`
  - [ ] Map errors to HTTP status codes: `TaskNotFoundError` → 404, `ValidationError` → 400, unknown → 500
  - [ ] Log full error context (stack, request details) via Pino
  - [ ] Return sanitized error responses (no stack traces in production)

- [ ] Task 5: Create health check routes (AC1)
  - [ ] Create `packages/backend/src/routes/health.ts`
  - [ ] `GET /health` — returns `{ status: "healthy", timestamp }` (basic, fast)
  - [ ] `GET /health/detailed` — returns database check + memory usage (200 or 503)

- [ ] Task 6: Build Fastify app configuration (AC1)
  - [ ] Create `packages/backend/src/app.ts` with `buildApp()` export
  - [ ] Register Pino logger from `logger.ts`
  - [ ] Register `@fastify/cors` with `FRONTEND_URL` origin
  - [ ] Register Prisma plugin
  - [ ] Register health routes
  - [ ] Register centralized error handler
  - [ ] Set `requestIdHeader: 'x-request-id'` for request correlation
  - [ ] Add request/response logging hooks (method, url, statusCode, responseTime)

- [ ] Task 7: Replace placeholder `index.ts` with real server entry (AC1, AC4)
  - [ ] Replace `packages/backend/src/index.ts` content
  - [ ] Import `env` (triggers validation on startup)
  - [ ] Import and call `buildApp()`
  - [ ] Call `app.listen({ port: env.PORT, host: '0.0.0.0' })`
  - [ ] Log startup message with port and NODE_ENV
  - [ ] Handle startup errors with graceful exit

- [ ] Task 8: Run Prisma migration (AC2)
  - [ ] Ensure Docker database container is running (`docker compose --profile local up -d database-local`)
  - [ ] Run `pnpm --filter backend prisma migrate dev --name init`
  - [ ] Verify migration creates `tasks` table with correct columns and composite index
  - [ ] Verify Prisma client is generated (`@prisma/client` types available)

- [ ] Task 9: Verify all ACs (AC1, AC2, AC3, AC4)
  - [ ] Start database: `docker compose --profile local up -d database-local`
  - [ ] Run `pnpm --filter backend dev` — verify server starts, Pino logs appear
  - [ ] `curl http://localhost:3000/health` — verify 200 response
  - [ ] `curl http://localhost:3000/health/detailed` — verify database check passes
  - [ ] Modify a file in `packages/backend/src` — verify tsx watch restarts server
  - [ ] Run `pnpm type-check` — verify zero TypeScript errors
  - [ ] Run `pnpm lint` — verify zero ESLint errors

## Dev Notes

### CRITICAL: This Story Builds Server Infrastructure Only

Story 1.3 creates the **Fastify server skeleton** — app configuration, Prisma connection, Pino logging, health endpoints, CORS, and error handling. Do NOT implement:
- Task CRUD routes (`/api/v1/tasks`) — Story 2.1+
- Service or repository layers — Story 2.1+
- Cleanup cron job — Story 3.8
- Frontend changes — Story 1.4

### CRITICAL: API Prefix is `/api/v1`

The architecture mandates URL-based versioning from day one. All future task routes will be registered under `/api/v1`. Health routes are **unversioned** (registered at root `/health`).
[Source: architecture-decisions-aine-bmad-test-2026-02-17.md#6-api-versioning--evolution]

### CRITICAL: `@fastify/cors` Version Compatibility

The backend `package.json` has `"@fastify/cors": "^9.0.0"`. The CORS plugin version 8.x is the officially documented version for Fastify 4.x. If you encounter compatibility errors, downgrade to `@fastify/cors@^8.0.0`. Check `pnpm ls @fastify/cors` to verify installed version.
[Source: npm registry — @fastify/cors version matrix]

### Exact Backend File Structure After This Story

```
packages/backend/
├── src/
│   ├── index.ts                 # Server entry point (replace placeholder)
│   ├── app.ts                   # Fastify app configuration (buildApp)
│   ├── config/
│   │   └── env.ts               # Zod env validation
│   ├── routes/
│   │   └── health.ts            # GET /health, GET /health/detailed
│   ├── plugins/
│   │   └── prisma.ts            # Prisma Fastify plugin
│   └── utils/
│       ├── logger.ts            # Pino logger setup
│       └── errorHandler.ts      # Centralized error handler
├── prisma/
│   ├── schema.prisma            # Already exists from Story 1.1
│   └── migrations/              # Created by prisma migrate dev
├── package.json
├── tsconfig.json
├── Dockerfile
└── .dockerignore
```
[Source: technical-architecture-aine-bmad-test-2026-02-17.md#backend-architecture]

### Exact `app.ts` Structure

```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { logger } from './utils/logger';
import { prismaPlugin } from './plugins/prisma';
import { healthRoutes } from './routes/health';
import { errorHandler } from './utils/errorHandler';
import { env } from './config/env';

export async function buildApp() {
  const fastify = Fastify({
    logger: logger,
    requestIdLogLabel: 'reqId',
    requestIdHeader: 'x-request-id',
  });

  await fastify.register(cors, {
    origin: env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  await fastify.register(prismaPlugin);
  await fastify.register(healthRoutes);

  fastify.setErrorHandler(errorHandler);

  return fastify;
}
```
[Source: architecture-decisions-aine-bmad-test-2026-02-17.md#3-error-handling--logging-strategy]

### Exact Logger Configuration

```typescript
import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
```
[Source: architecture-decisions-aine-bmad-test-2026-02-17.md#pino-configuration]

### Exact Environment Validation Schema

```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3000'),
  DATABASE_URL: z.string().url(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  FRONTEND_URL: z.string().url().optional(),
});
```
Note: `PORT` defaults to `'3000'` as a string that transforms to number 3000. `DATABASE_URL` is required with no default (must be provided).
[Source: architecture-decisions-aine-bmad-test-2026-02-17.md#8-build--deployment-pipeline]

### Exact Error Handler

The error handler MUST produce this response shape:
```typescript
interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
  timestamp: string;
  path: string;
  requestId?: string;
}
```
- For 5xx errors: `error` is always `"Internal server error"` (never expose internals)
- For 4xx errors: `error` is the actual error message, include `details` for validation errors
- Always include `requestId` from `request.id` for log correlation
[Source: architecture-decisions-aine-bmad-test-2026-02-17.md#centralized-error-handler]

### Exact Health Check Response Shapes

**`GET /health`** (basic, fast — no DB check):
```json
{ "status": "healthy", "timestamp": "2026-02-18T10:00:00.000Z" }
```

**`GET /health/detailed`** (includes DB + memory):
```json
{
  "status": "healthy",
  "timestamp": "2026-02-18T10:00:00.000Z",
  "uptime": 123.456,
  "checks": {
    "database": "up",
    "memory": { "used": 50, "total": 100, "percentage": 50 }
  }
}
```
Returns 503 if database is down.
[Source: architecture-decisions-aine-bmad-test-2026-02-17.md#7-performance-monitoring]

### Prisma Plugin Pattern

Create as a Fastify plugin using `fastify-plugin` to ensure it decorates the root instance:
```typescript
import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

export const prismaPlugin = fp(async (fastify) => {
  const prisma = new PrismaClient();
  await prisma.$connect();
  fastify.decorate('prisma', prisma);
  fastify.addHook('onClose', async () => { await prisma.$disconnect(); });
});
```
Note: `fastify-plugin` is needed as a dev dependency. Check if it's already in `package.json`; if not, install it. The `PrismaClient` constructor uses `DATABASE_URL` from process.env automatically.

### Prisma Migration Approach

The Prisma schema (`packages/backend/prisma/schema.prisma`) already exists from Story 1.1 with the Task model. Run migration against the local Docker database:

```bash
# Ensure database is running
docker compose --profile local up -d database-local

# Run migration from the backend package
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/todo_app_dev pnpm --filter backend prisma migrate dev --name init
```

The `DATABASE_URL` must point to `localhost` (not Docker hostname `database-local`) when running migrations from the host machine. Inside Docker containers, the hostname is `database-local`.

### Backend `tsconfig.json` — noEmit: true

The backend tsconfig has `"noEmit": true` (set in Story 1.1 code review). This means:
- `pnpm run build` (`tsc`) produces no output — this is intentional for the scaffold phase
- `tsx watch` handles runtime compilation (no `.js` files needed locally)
- Type checking uses `pnpm type-check` (`tsc --noEmit`)
- Docker build stage overrides this with `--noEmit false` (handled in Story 1.2 Dockerfile)

Do NOT change `noEmit` in tsconfig.json. The current setup is correct.
[Source: Story 1.1 code review — H3 fix, Story 1.2 code review — H3 fix]

### Required New Dependencies

The following packages must be installed for this story (check if already present):
- `fastify-plugin` — wraps Prisma into a proper Fastify plugin
- `@vitest/coverage-v8` — may be needed for test coverage (Story 1.5, but ensure no version conflicts)

All other dependencies (`fastify`, `@fastify/cors`, `@prisma/client`, `pino`, `pino-pretty`, `zod`, `tsx`) are already in `packages/backend/package.json` from Story 1.1.

### Request/Response Logging Hooks

Add `onRequest` and `onResponse` hooks in `app.ts` to log incoming requests and outgoing responses with timing:
```typescript
fastify.addHook('onRequest', async (request) => {
  request.log.info({ method: request.method, url: request.url }, 'Incoming request');
});

fastify.addHook('onResponse', async (request, reply) => {
  request.log.info(
    { method: request.method, url: request.url, statusCode: reply.statusCode, responseTime: reply.getResponseTime() },
    'Request completed'
  );
});
```
[Source: architecture-decisions-aine-bmad-test-2026-02-17.md#fastify-logger-integration]

### Docker Compose Local Development Workflow

For this story, use **hybrid mode** (database in Docker, backend locally):
```bash
docker compose --profile local up -d database-local
cd packages/backend
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/todo_app_dev pnpm run dev
```

Or set `DATABASE_URL` in a local `.env` file for the backend. The `.env.development` at project root already has `DATABASE_URL` but with Docker hostname `database-local` — override to `localhost` when running locally.

### TypeScript Strict Mode Constraints

`tsconfig.base.json` enforces:
- `strict: true` (all strict checks)
- `noUncheckedIndexedAccess: true` — array/object access returns `T | undefined`
- `noImplicitReturns: true` — every code path must return
- `exactOptionalPropertyTypes: true` — optional props require explicit `undefined`
- `noFallthroughCasesInSwitch: true`

All code must compile with zero type errors under these settings.

### Fastify Type Augmentation for Prisma

When decorating Fastify with Prisma, augment the type to enable `fastify.prisma`:
```typescript
import { PrismaClient } from '@prisma/client';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}
```
Place this in the `prisma.ts` plugin file.

### Previous Story Learnings

**From Story 1.1:**
- `pnpm.onlyBuiltDependencies` in root package.json pre-approves Prisma build scripts
- Backend tsconfig uses ESNext/bundler resolution with `noEmit: true`
- `@aine/shared` is imported as a type-only dependency — backend placeholder uses `import type { GetTasksResponse } from '@aine/shared'`
- ESLint config at root applies across all packages

**From Story 1.2:**
- Docker build context is project root (`.`), not `packages/backend`
- `tsconfig.base.json` is copied into Docker image in dependencies stage
- Backend Dockerfile `build` stage uses `pnpm exec tsc -p packages/backend/tsconfig.json --noEmit false` to override noEmit
- Database hostnames inside Docker are `database-local`, `database-test`, `database-prod` (not `localhost`)
- `.env.development` has `DATABASE_URL=postgresql://postgres:postgres@database-local:5432/todo_app_dev` (Docker hostname)

### Existing Prisma Schema (Do NOT Modify)

The schema at `packages/backend/prisma/schema.prisma` is complete from Story 1.1:
```prisma
enum TaskStatus { ACTIVE  COMPLETED }
model Task {
  id          String     @id @default(uuid())
  text        String     @db.VarChar(500)
  status      TaskStatus @default(ACTIVE)
  createdAt   DateTime   @default(now()) @map("created_at")
  completedAt DateTime?  @map("completed_at")
  @@map("tasks")
  @@index([status, createdAt])
}
```
Do NOT modify the schema in this story. Only run the migration.

### References

- Backend project structure: [Source: technical-architecture-aine-bmad-test-2026-02-17.md#backend-architecture]
- Fastify app configuration: [Source: architecture-decisions-aine-bmad-test-2026-02-17.md#3-error-handling--logging-strategy]
- Pino logger setup: [Source: architecture-decisions-aine-bmad-test-2026-02-17.md#backend-logging-setup]
- Health check routes: [Source: architecture-decisions-aine-bmad-test-2026-02-17.md#7-performance-monitoring]
- Error handler: [Source: architecture-decisions-aine-bmad-test-2026-02-17.md#centralized-error-handler]
- Environment validation: [Source: architecture-decisions-aine-bmad-test-2026-02-17.md#8-build--deployment-pipeline]
- API versioning (/api/v1): [Source: architecture-decisions-aine-bmad-test-2026-02-17.md#6-api-versioning--evolution]
- Prisma schema: [Source: technical-architecture-aine-bmad-test-2026-02-17.md#data-models]
- Docker Compose profiles: [Source: architecture-decisions-aine-bmad-test-2026-02-17.md#2-development-environment-details]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
