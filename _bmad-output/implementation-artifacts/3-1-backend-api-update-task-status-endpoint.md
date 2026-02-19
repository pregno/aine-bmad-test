# Story 3.1: Backend API - Update Task Status Endpoint

Status: done

## Story

As a user,
I want the backend to update task status and capture completion timestamps,
so that my completed tasks are tracked with accurate timing data.

## Acceptance Criteria

1. **[AC1] Mark task as COMPLETED** — Given an active task exists with `id: "123"` and `status: "ACTIVE"`, when I send `PATCH /api/v1/tasks/123` with `{ "status": "COMPLETED" }`, then the response is 200 OK with the updated task having `status: "COMPLETED"` and `completedAt` set to the current server time, and the database reflects the change.

2. **[AC2] Toggle task back to ACTIVE** — Given a completed task exists with `id: "456"` and `status: "COMPLETED"`, when I send `PATCH /api/v1/tasks/456` with `{ "status": "ACTIVE" }`, then the response is 200 OK with `status: "ACTIVE"` and `completedAt: null`, and the task can be toggled back and forth between states.

3. **[AC3] 404 for non-existent task** — Given I send `PATCH /api/v1/tasks/nonexistent-id` with valid status, then the response is 404 Not Found with error message `"Task not found"` (exact string).

4. **[AC4] 400 for invalid status** — Given I send `PATCH /api/v1/tasks/123` with `{ "status": "INVALID" }`, then the response is 400 Bad Request with a validation error indicating status must be "ACTIVE" or "COMPLETED".

5. **[AC5] 500 and no data corruption on DB failure** — Given the database connection fails during update, when I send a valid update request, then the response is 500 Internal Server Error, Pino logs the error with full context, and the task status remains unchanged in the database (Prisma transaction rollback).

## Tasks / Subtasks

- [x] **Task 1: Add `updateTaskSchema` to the schemas file** (AC: 4)
  - [x] Add `updateTaskSchema` with Zod: `z.object({ status: z.nativeEnum(TaskStatus) })` using the `TaskStatus` enum from `@aine/shared`
  - [x] Export the schema and infer `UpdateTaskInput` type
  - [x] File: `packages/backend/src/schemas/tasks.ts`

- [x] **Task 2: Add PATCH route to the existing `taskRoutes` plugin** (AC: 1, 2, 3, 4, 5)
  - [x] Add `fastify.patch<{ Params: { id: string }; Body: { status?: string } }>('/tasks/:id', ...)` inside the existing `taskRoutes` function in `packages/backend/src/routes/tasks.ts`
  - [x] Validate request body using `updateTaskSchema.safeParse()` — throw `ValidationError` on failure
  - [x] Compute `completedAt`: if transitioning to `COMPLETED` → `new Date()`; if to `ACTIVE` → `null`
  - [x] Call `fastify.prisma.task.update({ where: { id }, data: { status, completedAt } })`
  - [x] Catch Prisma `PrismaClientKnownRequestError` with code `P2025` (record not found) → throw `TaskNotFoundError` (already exported from `errorHandler.ts`)
  - [x] Return `reply.status(200).send({ task: toSharedTask(updated) })` — reuse existing `toSharedTask` helper
  - [x] Import `UpdateTaskResponse` from `@aine/shared` for response typing
  - [x] Import `PrismaClientKnownRequestError` from `@prisma/client/runtime/library`

- [x] **Task 3: Write integration tests** (AC: 1, 2, 3, 4, 5)
  - [x] Create `packages/backend/tests/integration/tasks.update.test.ts`
  - [x] Follow the exact same structure as `tasks.create.test.ts`:
    - `beforeAll`: `buildApp()` + `app.ready()`
    - `afterAll`: `app.close()`
    - Use `app.inject()` for HTTP requests
    - Use `getTestPrisma()` for direct DB assertions
  - [x] Test AC1: POST a task, PATCH to COMPLETED, assert 200 + correct shape + `completedAt` is an ISO string + DB persistence
  - [x] Test AC2: Create a completed task directly via Prisma, PATCH back to ACTIVE, assert 200 + `completedAt: null`
  - [x] Test toggle round-trip: ACTIVE → COMPLETED → ACTIVE with timestamp behavior
  - [x] Test AC3: PATCH unknown UUID → 404 with `error: "Task not found"` (exact match)
  - [x] Test AC4: PATCH with `{ status: "INVALID" }` → 400 with `code: "VALIDATION_ERROR"`
  - [x] Test AC4: PATCH with empty body `{}` → 400 with `code: "VALIDATION_ERROR"`
  - [x] Test AC5: Mock `fastify.prisma.task.update` to throw → 500 with `error: "Internal server error"` + `requestId` present

## Dev Notes

### Critical Architecture Constraints

- **Do NOT create a new route file.** Add the PATCH handler inside the existing `taskRoutes` plugin in `packages/backend/src/routes/tasks.ts`. All task routes live in this single file/plugin.
- **Do NOT modify `packages/shared/src/types/api.ts`.** `UpdateTaskRequest`, `UpdateTaskResponse` types already exist there and are ready to use.
- **Reuse `toSharedTask` helper.** It is already defined in `tasks.ts` and converts Prisma records to the shared `Task` type.
- **Reuse `TaskNotFoundError`.** Already exported from `packages/backend/src/utils/errorHandler.ts` — accepts a task ID string. The error handler maps it to 404 automatically.
- **Reuse `ValidationError`.** Already exported from `errorHandler.ts` — accepts `(message, details?)`. Maps to 400 automatically.
- **`PrismaClientKnownRequestError` code `P2025`** is how Prisma signals a record was not found during `update`. Catch it and throw `TaskNotFoundError(id)`.
- **`completedAt` logic**: `COMPLETED` → `new Date()` (current server time); `ACTIVE` → `null` (clears the timestamp). This is the single source of truth — never accept `completedAt` from the client.

### Project Structure Notes

```
packages/
  backend/
    src/
      routes/
        tasks.ts                  ← ADD PATCH handler here (do not create new file)
      schemas/
        tasks.ts                  ← ADD updateTaskSchema here
    tests/
      integration/
        tasks.update.test.ts      ← CREATE new integration test file
  shared/
    src/
      types/
        api.ts                    ← Already has UpdateTaskRequest, UpdateTaskResponse (DO NOT MODIFY)
        task.ts                   ← Already has TaskStatus enum (DO NOT MODIFY)
```

### Key Zod Schema Pattern (follow existing `createTaskSchema`)

```typescript
import { TaskStatus } from '@aine/shared';

export const updateTaskSchema = z.object({
  status: z.nativeEnum(TaskStatus, {
    errorMap: () => ({ message: 'Status must be "ACTIVE" or "COMPLETED"' }),
  }),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
```

### Key Route Handler Pattern (inside existing `taskRoutes` plugin)

```typescript
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

fastify.patch<{ Params: { id: string }; Body: { status?: string } }>(
  '/tasks/:id',
  async (request, reply) => {
    const { id } = request.params;

    const parsed = updateTaskSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const statusErr = flat.fieldErrors['status']?.[0];
      const message = statusErr ?? parsed.error.errors[0]?.message ?? 'Validation failed';
      throw new ValidationError(message, flat);
    }

    const { status } = parsed.data;
    const completedAt = status === TaskStatus.COMPLETED ? new Date() : null;

    try {
      const updated = await fastify.prisma.task.update({
        where: { id },
        data: { status, completedAt },
      });

      const response: UpdateTaskResponse = { task: toSharedTask(updated) };
      return reply.status(200).send(response);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new TaskNotFoundError(id);
      }
      throw err;
    }
  }
);
```

### Testing Infrastructure Reference

- Tests run via: `pnpm --filter backend test:integration`
- Config: `packages/backend/vitest.integration.config.ts` — includes `tests/integration/**/*.test.ts`
- Global setup: `tests/setup.ts` — starts a Testcontainers PostgreSQL 16 instance, runs Prisma migrations, cleans DB between tests
- Do NOT repeat `beforeAll`/`afterAll` for DB setup — the global setup handles it; you only need app lifecycle (`buildApp()`, `app.close()`)
- Use `vi.spyOn(app.prisma.task, 'update').mockRejectedValueOnce(...)` to test AC5 (DB error), then `spy.mockRestore()` in cleanup

### Response Shape Reference

**PATCH /api/v1/tasks/:id → 200 OK:**
```json
{
  "task": {
    "id": "uuid-here",
    "text": "Review PR #123",
    "status": "COMPLETED",
    "createdAt": "2026-02-18T10:00:00.000Z",
    "completedAt": "2026-02-18T14:30:00.000Z"
  }
}
```

**PATCH /api/v1/tasks/:id → 404 Not Found:**
```json
{
  "error": "Task not found: nonexistent-id",
  "code": "TASK_NOT_FOUND",
  "timestamp": "...",
  "path": "/api/v1/tasks/nonexistent-id",
  "requestId": "..."
}
```
> Note: The AC3 says `"Task not found"` — the actual error message from `TaskNotFoundError` is `"Task not found: {id}"`. Tests should match the actual implementation (use `.toContain('Task not found')` or test the exact message from `TaskNotFoundError`).

**PATCH /api/v1/tasks/:id → 400 Bad Request:**
```json
{
  "error": "Status must be \"ACTIVE\" or \"COMPLETED\"",
  "code": "VALIDATION_ERROR",
  "details": { ... },
  "timestamp": "...",
  "path": "...",
  "requestId": "..."
}
```

### Architecture References

- [Source: architecture.md / ARCH-3] API Spec: `PATCH /api/v1/tasks/:id` — updates task status
- [Source: architecture.md / ARCH-4] Data Model: `status ENUM(ACTIVE, COMPLETED)`, `completedAt TIMESTAMP nullable`
- [Source: epics.md / Story 3.1 AC1-5] Full acceptance criteria with BDD scenarios

### Learnings from Previous Stories (Story 2.1, 2.2)

- `createTaskSchema` uses `z.string().transform().pipe()` — for this story, `z.nativeEnum(TaskStatus)` is simpler and sufficient
- Always call `parsed.error.flatten()` to extract field-level error messages for `ValidationError`
- `Prisma` errors must be caught manually in route handlers; the global error handler only handles `AppError` subclasses and generic `Error`s — so the `P2025` catch block is required
- Tests that verify DB state should call `getTestPrisma()` and inspect the persisted record directly
- The `app.inject()` pattern with `method`, `url`, `headers: { 'content-type': 'application/json' }`, and `payload` is the established pattern

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Debug Log References

- Spy restoration issue: `vi.spyOn(app.prisma.task, 'update').mockRestore()` does not reliably restore the Prisma client method when called after `afterEach(vi.restoreAllMocks())`. Resolved by placing the AC5 spy test last in the describe block so no subsequent tests are affected by incomplete restoration.

### Completion Notes List

- AC1: Added `PATCH /api/v1/tasks/:id` handler inside existing `taskRoutes` plugin. Sets `completedAt: new Date()` on COMPLETED transition. Returns updated task as `UpdateTaskResponse`.
- AC2: Setting status to `ACTIVE` clears `completedAt: null`. Toggle round-trip validated in tests.
- AC3: Catches `PrismaClientKnownRequestError` with code `P2025` and throws `TaskNotFoundError(id)`, which maps to 404 via the global error handler.
- AC4: `updateTaskSchema` uses `z.nativeEnum(TaskStatus)` with a custom `errorMap` for clear error message. Both invalid value and empty body return 400 with `VALIDATION_ERROR` code.
- AC5: Generic `throw err` re-throws non-P2025 Prisma errors. The global error handler catches and returns 500 with sanitized message. Task status verified unchanged in DB after spy test.
- All 21 integration tests pass (8 new + 13 existing). All 33 frontend unit tests pass (no regressions). Backend unit tests pass at 100% statement/branch/line coverage.
- Code review fixes: Added `uuidParamSchema` for :id validation (400 on malformed UUID), `.strict()` on `updateTaskSchema` (reject extra fields), 2 new integration tests. Total 23 integration tests pass.

### File List

- packages/backend/src/schemas/tasks.ts (modified — added `updateTaskSchema`, `UpdateTaskInput`, `uuidParamSchema`; `updateTaskSchema.strict()`)
- packages/backend/src/routes/tasks.ts (modified — added `PATCH /tasks/:id` handler, UUID validation, new imports)
- packages/backend/tests/integration/tasks.update.test.ts (created — 10 integration tests for all ACs + invalid UUID + extra fields)

### Change Log

- Story 3.1 implementation complete: added `updateTaskSchema` (Zod `nativeEnum`) and `PATCH /api/v1/tasks/:id` route with P2025 handling, completedAt logic, and 8 integration tests covering all 5 ACs (Date: 2026-02-19)
- Code review fixes applied: UUID validation on `:id` param (`uuidParamSchema`), `.strict()` on `updateTaskSchema` to reject extra fields, added tests for invalid UUID (400) and extra body fields (400) (Date: 2026-02-19)

---

## Senior Developer Review (AI)

**Review Date:** 2026-02-19  
**Reviewer:** Adversarial Code Review Workflow  
**Outcome:** Approved after fixes

### Summary

Review identified 2 MEDIUM and 3 LOW issues. All MEDIUM issues were fixed automatically.

### Resolved Findings

1. **[MEDIUM] No UUID validation on :id param**: Added `uuidParamSchema` (z.string().uuid()) and validation at start of PATCH handler; malformed IDs now return 400 instead of 500.
2. **[MEDIUM] Missing test for invalid UUID**: Added integration test for `PATCH /api/v1/tasks/not-a-valid-uuid` → 400 with VALIDATION_ERROR.
3. **[MEDIUM] updateTaskSchema accepts extra fields**: Added `.strict()` to schema; payloads with unknown keys (e.g. `completedAt`) now return 400; added test for extra fields.

### Open Items (LOW, deferred)

- AC3 message format: Implementation returns "Task not found: {id}"; story acknowledged.
- UpdateTaskInput exported but unused: Minor; type useful for API docs.
