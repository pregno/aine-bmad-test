# Story 2.2: Backend API - Get All Tasks Endpoint with Sorting

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to retrieve all my tasks sorted chronologically,
so that I can see active tasks newest-first and completed tasks oldest-first.

## Acceptance Criteria

**AC1 — Tasks returned with correct sort order**
- **Given** the database contains 5 active tasks and 3 completed tasks
- **When** I send `GET /api/v1/tasks`
- **Then** the response has status 200 OK
- **And** the response body contains a `tasks` array with all 8 tasks
- **And** active tasks appear before completed tasks in the array
- **And** within active tasks, sorting is by `createdAt` DESC (newest first)
- **And** within completed tasks, sorting is by `completedAt` ASC (oldest first)

**AC2 — Empty database returns empty array**
- **Given** the database has no tasks
- **When** I send `GET /api/v1/tasks`
- **Then** the response has status 200 OK
- **And** the response body contains an empty `tasks` array `{ "tasks": [] }`

**AC3 — Database failure returns 500**
- **Given** the database connection fails
- **When** I send `GET /api/v1/tasks`
- **Then** the response has status 500 Internal Server Error
- **And** Pino logs the error with stack trace
- **And** the response body contains a generic error message

**AC4 — Task JSON includes createdAt and completedAt**
- **Given** a task has `createdAt: "2026-02-18T10:00:00Z"` and `status: "ACTIVE"`
- **When** I retrieve all tasks
- **Then** the task's JSON includes both `createdAt` and `completedAt` fields
- **And** `completedAt` is `null` for active tasks

## Tasks / Subtasks

- [x] Task 1: Add GET /tasks handler to task routes (AC1, AC2, AC4)
  - [x] In `packages/backend/src/routes/tasks.ts`, add `GET /tasks` handler
  - [x] Use `fastify.prisma.task.findMany()` with ordering:
    - Active tasks: `orderBy: { createdAt: 'desc' }` where `status: 'ACTIVE'`
    - Completed tasks: `orderBy: { completedAt: 'asc' }` where `status: 'COMPLETED'`
  - [x] Combine into single array: active tasks first, then completed (or use raw Prisma query with composite index)
  - [x] Map Prisma Task to `@aine/shared` Task shape (id, text, status, createdAt, completedAt)
  - [x] Return 200 with `{ tasks: GetTasksResponse }` per `@aine/shared/types/api.ts`
  - [x] Use `toSharedTaskStatus()` helper from Story 2-1 for status mapping

- [x] Task 2: Implement sort logic (AC1)
  - [x] Query: two `findMany` calls (active + completed) or single query with `orderBy` that achieves same result
  - [x] Prisma: use `where: { status: 'ACTIVE' }` + `orderBy: { createdAt: 'desc' }` for active; `where: { status: 'COMPLETED' }` + `orderBy: { completedAt: 'asc' }` for completed; concatenate

- [x] Task 3: Add integration tests for GET endpoint (AC1–AC4)
  - [x] Add tests in `packages/backend/tests/integration/tasks.get.test.ts` (or extend tasks.create → tasks.test.ts)
  - [x] Test: empty DB → 200, `{ tasks: [] }`
  - [x] Test: with tasks → 200, correct sort (active DESC, completed ASC), active before completed
  - [x] Test: task JSON has createdAt and completedAt; completedAt null for active
  - [x] Test: DB failure (mock findMany rejection) → 500, generic message

- [x] Task 4: Verify all ACs and existing tests (AC1–AC4)
  - [x] Run `pnpm --filter backend test:integration` → all pass
  - [x] Run `pnpm test` → all pass
  - [x] Run `pnpm type-check` and `pnpm lint` → zero errors (backend; frontend has pre-existing type issues)

## Dev Notes

### CRITICAL: API Prefix is `/api/v1`

All task routes MUST be registered under `/api/v1`.
[Source: architecture-decisions-aine-bmad-test-2026-02-17.md#6-api-versioning--evolution]

### CRITICAL: Use `@aine/shared` Types

- `GetTasksResponse` — `{ tasks: Task[] }`
- `Task` — `{ id, text, status, createdAt, completedAt }`

Import from `@aine/shared` for response shape consistency.
[Source: packages/shared/src/types/api.ts]

### Exact Response Contract

**Response** (200 OK):
```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "text": "Review Sarah's PR",
      "status": "ACTIVE",
      "createdAt": "2026-02-17T09:15:30.000Z",
      "completedAt": null
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "text": "Update sprint board",
      "status": "COMPLETED",
      "createdAt": "2026-02-17T09:16:45.000Z",
      "completedAt": "2026-02-17T12:30:00.000Z"
    }
  ]
}
```

**Empty** (200 OK): `{ "tasks": [] }`
[Source: technical-architecture-aine-bmad-test-2026-02-17.md#api-specifications]

### Prisma Sort Strategy

Option A — Two queries, concatenate:
```typescript
const [activeTasks, completedTasks] = await Promise.all([
  fastify.prisma.task.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  }),
  fastify.prisma.task.findMany({
    where: { status: 'COMPLETED' },
    orderBy: { completedAt: 'asc' },
  }),
]);
const tasks = [...activeTasks, ...completedTasks];
```

Option B — Single query with raw SQL or `findMany` + manual sort (less efficient).

Prefer Option A for clarity and use of existing composite index `(status, createdAt)`.
[Source: packages/backend/prisma/schema.prisma]

### Previous Story Learnings (Story 2-1)

- **Route module**: `packages/backend/src/routes/tasks.ts` — add GET handler alongside POST
- **toSharedTaskStatus()**: Reuse for mapping Prisma enum → shared Task status
- **Task mapping**: `{ id, text, status: toSharedTaskStatus(t.status), createdAt: t.createdAt.toISOString(), completedAt: t.completedAt?.toISOString() ?? null }`
- **Error flow**: DB errors bubble to centralized error handler → 500 with generic message
- **Integration tests**: Use `buildApp()`, `app.inject()`, `getTestPrisma()`; mock `prisma.task.findMany` for AC3
- **setErrorHandler**: Registered before routes in `app.ts` — all thrown errors use it
[Source: 2-1-backend-api-create-task-endpoint.md]

### Do NOT Implement in This Story

- PATCH, DELETE endpoints — Stories 3.1, 3.2
- Frontend changes — Story 2.3+
- Pagination or filtering — not in scope

### References

- GET /api/tasks spec: [Source: technical-architecture-aine-bmad-test-2026-02-17.md#api-specifications]
- Prisma schema + index: [Source: packages/backend/prisma/schema.prisma]
- Shared types: [Source: packages/shared/src/types/api.ts]
- Story 2-1 implementation: [Source: packages/backend/src/routes/tasks.ts]

## Dev Agent Record

### Agent Model Used

Claude (Cursor)

### Debug Log References

- Used `Promise.all` for parallel active + completed queries; added `toSharedTask()` helper to reuse mapping logic from POST handler.

### Completion Notes List

- Added GET /tasks handler in `packages/backend/src/routes/tasks.ts`: two findMany calls (active DESC, completed ASC), concatenated, mapped via `toSharedTask()`.
- Refactored POST handler to use `toSharedTask()` for consistency.
- Created `packages/backend/tests/integration/tasks.get.test.ts`: empty DB, sort order, task JSON shape, DB failure mock.
- All ACs satisfied: AC1 (sort order), AC2 (empty array), AC3 (500 on DB failure), AC4 (createdAt/completedAt fields).
- Integration tests: 13 total (2 health + 6 create + 5 GET), all pass. Backend type-check and lint pass.
- **Code Review 2026-02-18:** Fixed AC3 test mock cleanup (try/finally); added completed-task completedAt test for AC4.

### Review Follow-ups (AI)

- [ ] [LOW] Consider 5 active + 3 completed tasks in AC1 test for literal AC match
- [ ] [LOW] Extract magic numbers (3000, 5000 ms) to named constants in tests
- [ ] [LOW] Consider (status, completedAt) index for completed-query scale

### File List

**New files:**
- `packages/backend/tests/integration/tasks.get.test.ts` — Integration tests for GET /api/v1/tasks

**Modified files:**
- `packages/backend/src/routes/tasks.ts` — Added GET /tasks handler; added toSharedTask(); refactored POST to use toSharedTask()

### Change Log

- 2026-02-18: Story 2.2 implemented — GET /api/v1/tasks endpoint with sorting (active DESC, completed ASC), GetTasksResponse, integration tests.
- 2026-02-18: Code Review — AC3 test try/finally for mock restore; added completed-task completedAt test; 3 LOW follow-ups.
