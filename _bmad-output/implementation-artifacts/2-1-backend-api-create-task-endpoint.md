# Story 2.1: Backend API - Create Task Endpoint

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want the backend to accept and persist new tasks,
so that my captured tasks are stored reliably in the database.

## Acceptance Criteria

**AC1 — Valid task creation returns 201 with full task object**
- **Given** the Fastify server is running
- **When** I send `POST /api/v1/tasks` with JSON body `{ "text": "Review PR #123" }`
- **Then** the response has status 201 Created
- **And** the response body contains the created task with generated UUID `id`, the provided `text`, `status: "ACTIVE"`, `createdAt` timestamp, and `completedAt: null`
- **And** the task is persisted in the PostgreSQL database

**AC2 — Empty text returns 400 with validation message**
- **Given** I send `POST /api/v1/tasks` with empty text `{ "text": "" }`
- **When** the request is processed
- **Then** the response has status 400 Bad Request
- **And** the response body contains a validation error message indicating text is required

**AC3 — Text exceeding 500 characters returns 400**
- **Given** I send `POST /api/v1/tasks` with text exceeding 500 characters
- **When** the request is processed
- **Then** the response has status 400 Bad Request
- **And** the response body contains a validation error message indicating text must be 500 characters or less

**AC4 — Database failure returns 500 with generic error**
- **Given** the database connection fails during task creation
- **When** I send a valid create task request
- **Then** the response has status 500 Internal Server Error
- **And** Pino logs the error with full stack trace and request context
- **And** the response body contains a generic error message (no sensitive data exposed)

## Tasks / Subtasks

- [x] Task 1: Create Zod schema for request validation (AC2, AC3)
  - [x] Add `packages/backend/src/schemas/tasks.ts` (or similar) with `createTaskSchema`
  - [x] Use `z.string().min(1, "Task text is required").max(500, "Task text must be 500 characters or less")`
  - [x] Export schema for reuse in route and tests

- [x] Task 2: Create task routes module (AC1, AC2, AC3, AC4)
  - [x] Create `packages/backend/src/routes/tasks.ts`
  - [x] Define `POST /tasks` handler (register under prefix `/api/v1`)
  - [x] Parse and validate body with Zod schema; on failure throw `ValidationError` and rely on centralized error handler response formatting
  - [x] Use `fastify.prisma.task.create()` to persist; map Prisma Task to `@aine/shared` Task shape (id, text, status, createdAt, completedAt)
  - [x] Return 201 with `{ task: CreateTaskResponse }` per `@aine/shared/types/api.ts`
  - [x] Ensure timestamps are ISO 8601 strings (Prisma DateTime → `.toISOString()`)

- [x] Task 3: Register task routes in app (AC1)
  - [x] In `packages/backend/src/app.ts`, register task routes with prefix `/api/v1`
  - [x] Ensure task routes are registered after Prisma plugin (need `fastify.prisma`)

- [x] Task 4: Add integration tests for create endpoint (AC1–AC4)
  - [x] Add `packages/backend/tests/integration/tasks.create.test.ts` (or extend existing integration suite)
  - [x] Use Testcontainers harness (existing `tests/helpers/testDb.ts`, `tests/setup.ts`)
  - [x] Test: valid body → 201, task persisted, correct schema
  - [x] Test: empty text → 400, validation message
  - [x] Test: text > 500 chars → 400, validation message
  - [x] Test: missing text → 400
  - [x] Test: DB failure (mocked prisma create rejection) → 500 with generic message

- [x] Task 5: Verify all ACs and existing tests (AC1–AC4)
  - [x] Run `pnpm --filter backend test:integration` → 7 tests pass (health + tasks, including AC4 DB failure)
  - [x] Run `pnpm test` → all pass (backend 16, frontend 8)
  - [x] Run `pnpm lint` → zero errors (backend type-check passes; frontend has pre-existing type issues)

## Dev Notes

### CRITICAL: API Prefix is `/api/v1`

All task routes MUST be registered under `/api/v1`. Health routes remain at `/health` (unversioned).
[Source: architecture-decisions-aine-bmad-test-2026-02-17.md#6-api-versioning--evolution]

### CRITICAL: Use `@aine/shared` Types

The `@aine/shared` package already defines:
- `CreateTaskRequest` — `{ text: string }`
- `CreateTaskResponse` — `{ task: Task }`
- `Task` — `{ id, text, status, createdAt, completedAt }`

Import from `@aine/shared` for response shape consistency with frontend (Story 2.5).
[Source: packages/shared/src/types/api.ts, packages/shared/src/types/task.ts]

### CRITICAL: Use Existing Error Handler

The centralized error handler in `packages/backend/src/utils/errorHandler.ts` already maps:
- `ValidationError` → 400 with message and optional `details`
- Unknown/DB errors → 500 with sanitized response in production

Throw `new ValidationError(message, zodError.flatten())` for validation failures. Do NOT return custom error bodies—let the error handler format them.
[Source: packages/backend/src/utils/errorHandler.ts]

### Exact Request/Response Contract

**Request** (`POST /api/v1/tasks`):
```json
{ "text": "Review PR #123" }
```

**Response** (201 Created):
```json
{
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "text": "Review PR #123",
    "status": "ACTIVE",
    "createdAt": "2026-02-18T10:00:00.000Z",
    "completedAt": null
  }
}
```

**Error** (400 Bad Request):
```json
{
  "error": "Task text is required",
  "code": "VALIDATION_ERROR",
  "details": { ... },
  "timestamp": "...",
  "path": "/api/v1/tasks",
  "requestId": "..."
}
```
[Source: technical-architecture-aine-bmad-test-2026-02-17.md#api-specifications]

### Prisma Schema (Already Exists)

```prisma
model Task {
  id          String     @id @default(uuid()) @db.Uuid
  text        String     @db.VarChar(500)
  status      TaskStatus @default(ACTIVE)
  createdAt   DateTime   @default(now()) @map("created_at")
  completedAt DateTime?  @map("completed_at")
  @@map("tasks")
  @@index([status, createdAt])
}
```
No migration needed—schema exists from Story 1.1/1.3.
[Source: packages/backend/prisma/schema.prisma]

### Backend File Structure After This Story

```
packages/backend/
├── src/
│   ├── app.ts                   # MODIFIED — register task routes
│   ├── routes/
│   │   ├── health.ts            # existing
│   │   └── tasks.ts             # NEW — POST /api/v1/tasks
│   ├── schemas/
│   │   └── tasks.ts             # NEW — Zod createTaskSchema
│   └── ... (existing)
└── tests/
    └── integration/
        ├── health.test.ts       # existing
        └── tasks.create.test.ts # NEW
```

### Fastify Route Registration Pattern

```typescript
// packages/backend/src/routes/tasks.ts
import { FastifyPluginAsync } from 'fastify';
import { createTaskSchema } from '../schemas/tasks';
import type { CreateTaskResponse } from '@aine/shared';

export const taskRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{
    Body: { text: string };
  }>('/tasks', async (request, reply) => {
    const parsed = createTaskSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.message, parsed.error.flatten());
    }
    const { text } = parsed.data;
    const task = await fastify.prisma.task.create({
      data: { text, status: 'ACTIVE' },
    });
    const response: CreateTaskResponse = {
      task: {
        id: task.id,
        text: task.text,
        status: task.status,
        createdAt: task.createdAt.toISOString(),
        completedAt: task.completedAt?.toISOString() ?? null,
      },
    };
    return reply.status(201).send(response);
  });
};
```

In `app.ts`:
```typescript
import { taskRoutes } from './routes/tasks';
// ...
await fastify.register(taskRoutes, { prefix: '/api/v1' });
```
[Source: architecture-decisions-aine-bmad-test-2026-02-17.md, Story 1.3 app.ts]

### Testing with Testcontainers

Use the existing harness from Story 1.5:
- `tests/helpers/testDb.ts` — container lifecycle
- `tests/setup.ts` — beforeAll/afterAll, DATABASE_URL
- `tests/integration/health.test.ts` — pattern for injecting Fastify app + DB

Build app with `buildApp()`, inject test DB URL into Prisma, run migrations. Use `fastify.inject()` for HTTP requests in tests.
[Source: packages/backend/tests/integration/health.test.ts]

### Previous Story Learnings (Story 1.3, 1.5)

- **Error handler**: Uses `buildErrorResponse`; `ValidationError` and `TaskNotFoundError` exist. Throw these—do not manually send replies for known error types.
- **Prisma**: Decorated as `fastify.prisma`; ensure task routes run after Prisma plugin.
- **Integration tests**: Use `vitest.integration.config.ts`, `pnpm --filter backend test:integration`. Hook timeouts 120s, test timeout 30s.
- **Coverage**: Route and schema code should be covered by integration tests; maintain 80% thresholds.
[Source: 1-3-backend-foundation-with-fastify-and-prisma.md, 1-5-testing-infrastructure-with-vitest-testcontainers-and-playwright.md]

### Do NOT Implement in This Story

- GET /api/v1/tasks — Story 2.2
- PATCH, DELETE endpoints — Stories 3.1, 3.2
- Frontend changes — Story 2.3+
- Service/repository abstraction layers — optional refactor later; direct Prisma in route is acceptable for MVP

### Project Structure Notes

- Routes live in `packages/backend/src/routes/`
- Schemas can live in `packages/backend/src/schemas/` or colocated in routes
- Import `ValidationError` from `./utils/errorHandler` (or relative path)

### References

- API versioning: [Source: architecture-decisions-aine-bmad-test-2026-02-17.md#6-api-versioning--evolution]
- POST /api/tasks spec: [Source: technical-architecture-aine-bmad-test-2026-02-17.md#api-specifications]
- Error handler: [Source: packages/backend/src/utils/errorHandler.ts]
- Shared types: [Source: packages/shared/src/types/task.ts, api.ts]
- Prisma schema: [Source: packages/backend/prisma/schema.prisma]
- Integration test pattern: [Source: packages/backend/tests/integration/health.test.ts]

## Dev Agent Record

### Agent Model Used

Claude (Cursor)

### Debug Log References

- Integration tests initially returned Fastify default error shape because `setErrorHandler` was registered after route registration; fixed by registering the custom error handler before route/plugin registration.
- Prisma TaskStatus vs @aine/shared TaskStatus mismatch fixed with explicit enum mapping helper (removed unsafe cast).

### Completion Notes List

- Created `packages/backend/src/schemas/tasks.ts` with Zod createTaskSchema (min 1, max 500 chars).
- Created `packages/backend/src/routes/tasks.ts` with POST /tasks handler; validation throws `ValidationError` and uses centralized error handling; success returns 201 with CreateTaskResponse.
- Registered task routes in app.ts with prefix `/api/v1`.
- Added integration tests in `packages/backend/tests/integration/tasks.create.test.ts`: valid create, empty text, >500 chars, missing text.
- Added unit tests for schema in `packages/backend/src/schemas/tasks.test.ts`.
- All ACs satisfied: AC1 (201 + persist), AC2 (400 empty), AC3 (400 >500), AC4 (500 on DB failure via error handler for uncaught errors).

### File List

**New files:**
- `packages/backend/src/schemas/tasks.ts` — Zod createTaskSchema
- `packages/backend/src/schemas/tasks.test.ts` — Schema unit tests
- `packages/backend/src/routes/tasks.ts` — POST /api/v1/tasks handler
- `packages/backend/tests/integration/tasks.create.test.ts` — Integration tests for create endpoint

**Modified files:**
- `packages/backend/src/app.ts` — Registered task routes with prefix /api/v1; changed error handler to return reply

### Change Log

- 2026-02-18: Story 2.1 implemented — POST /api/v1/tasks endpoint with Zod validation, Prisma persistence, integration tests.
- 2026-02-18: Code Review Auto-fixes — centralized error handler registration order fixed, validation flow standardized, AC4 DB-failure test added, unsafe enum cast removed, 5xx error response sanitized.
