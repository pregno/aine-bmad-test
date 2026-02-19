# Story 3.2: Backend API - Delete Single Task Endpoint

Status: done

## Story

As a user,
I want the backend to permanently delete tasks,
so that I can remove unwanted or erroneous tasks from my list.

## Acceptance Criteria

1. **[AC1] 204 No Content on successful delete** — Given a task exists with `id: "789"`, when I send `DELETE /api/v1/tasks/789`, then the response has status 204 No Content, the response body is empty, and the task is permanently removed from the database.

2. **[AC2] 404 for non-existent task** — Given I send `DELETE /api/v1/tasks/nonexistent-id`, when the request is processed, then the response has status 404 Not Found and the response body contains error message "Task not found" (or "Task not found: {id}" per existing `TaskNotFoundError` pattern).

3. **[AC3] Deleted task does not appear in GET** — Given I delete a task with `id: "789"` successfully, when I send `GET /api/v1/tasks` to retrieve all tasks, then the deleted task with `id: "789"` does not appear in the response and other tasks remain unaffected.

4. **[AC4] 500 and no data corruption on DB failure** — Given the database connection fails during deletion, when I send a valid delete request, then the response has status 500 Internal Server Error, Pino logs the error, and the task remains in the database.

## Tasks / Subtasks

- [x] **Task 1: Add DELETE route to the existing `taskRoutes` plugin** (AC: 1, 2, 4)
  - [x] Add `fastify.delete<{ Params: { id: string } }>('/tasks/:id', ...)` inside the existing `taskRoutes` function in `packages/backend/src/routes/tasks.ts`
  - [x] Validate `id` with `uuidParamSchema.safeParse(id)` — throw `ValidationError('Invalid task ID format')` on failure (consistent with PATCH handler)
  - [x] Call `fastify.prisma.task.delete({ where: { id } })`
  - [x] Catch `PrismaClientKnownRequestError` with code `P2025` (record not found) → throw `TaskNotFoundError(id)`
  - [x] On success, return `reply.status(204).send()` (empty body)
  - [x] Re-throw all other errors (generic handler returns 500, Pino logs via `request.log.error`)
  - [x] Import `PrismaClientKnownRequestError` from `@prisma/client/runtime/library` (already imported for PATCH)
  - [x] **Route ordering:** Place DELETE `/tasks/:id` so it does NOT shadow a future `DELETE /tasks/completed` route. When Story 3.3 adds bulk delete, `DELETE /tasks/completed` must be registered BEFORE `DELETE /tasks/:id` (otherwise `:id` would match "completed"). For 3.2, only `:id` exists — add the delete route after PATCH.

- [x] **Task 2: Write integration tests** (AC: 1, 2, 3, 4)
  - [x] Create `packages/backend/tests/integration/tasks.delete.test.ts`
  - [x] Follow the exact same structure as `tasks.update.test.ts`:
    - `beforeAll`: `buildApp()` + `app.ready()`
    - `afterEach`: `vi.restoreAllMocks()`
    - `afterAll`: `app.close()`
    - Use `app.inject()` for HTTP requests
    - Use `getTestPrisma()` for direct DB assertions
  - [x] Test AC1: Create task via Prisma, DELETE it, assert 204, assert body is empty (or undefined), assert task is gone from DB via `findUnique`
  - [x] Test AC2: DELETE non-existent UUID → 404 with `error` containing "Task not found", `code: "TASK_NOT_FOUND"`
  - [x] Test invalid UUID: DELETE `/api/v1/tasks/not-a-uuid` → 400 with `code: "VALIDATION_ERROR"`
  - [x] Test AC3: Create 2 tasks, DELETE one, GET all tasks, assert deleted task absent and other task present
  - [x] Test AC4: Mock `fastify.prisma.task.delete` to throw → 500 with `error: "Internal server error"`; assert task still in DB after failure
  - [x] Place the DB-failure spy test last (same pattern as tasks.update) to avoid mock leakage

## Dev Notes

### Critical Architecture Constraints

- **Do NOT create a new route file.** Add the DELETE handler inside the existing `taskRoutes` plugin in `packages/backend/src/routes/tasks.ts`. All task routes live in this single file/plugin.
- **Reuse `uuidParamSchema`.** Already exported from `packages/backend/src/schemas/tasks.ts` — validates UUID format and returns 400 for malformed ids.
- **Reuse `TaskNotFoundError`.** Already exported from `packages/backend/src/utils/errorHandler.ts` — accepts a task ID string. The global error handler maps it to 404 automatically.
- **Reuse `ValidationError`.** Already exported from `errorHandler.ts` — maps to 400.
- **`PrismaClientKnownRequestError` code `P2025`** is how Prisma signals a record was not found during `delete` (same as `update`). Catch it and throw `TaskNotFoundError(id)`.
- **204 No Content:** HTTP spec says 204 responses MUST NOT include a message body. Use `reply.status(204).send()` — Fastify sends an empty body. Do NOT return JSON.

### Project Structure Notes

```
packages/
  backend/
    src/
      routes/
        tasks.ts                  ← ADD DELETE handler here (do not create new file)
      schemas/
        tasks.ts                  ← No changes (uuidParamSchema already exists)
    tests/
      integration/
        tasks.delete.test.ts      ← CREATE new integration test file
```

### Key Route Handler Pattern (inside existing `taskRoutes` plugin)

```typescript
fastify.delete<{ Params: { id: string } }>('/tasks/:id', async (request, reply) => {
  const { id } = request.params;

  const idParsed = uuidParamSchema.safeParse(id);
  if (!idParsed.success) {
    throw new ValidationError('Invalid task ID format');
  }

  try {
    await fastify.prisma.task.delete({ where: { id } });
    return reply.status(204).send();
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new TaskNotFoundError(id);
    }
    throw err;
  }
});
```

### Response Shape Reference

**DELETE /api/v1/tasks/:id → 204 No Content:**
- Status: 204
- Body: empty (no JSON)

**DELETE /api/v1/tasks/:id → 404 Not Found:**
```json
{
  "error": "Task not found: nonexistent-id",
  "code": "TASK_NOT_FOUND",
  "timestamp": "...",
  "path": "/api/v1/tasks/nonexistent-id",
  "requestId": "..."
}
```

**DELETE /api/v1/tasks/:id → 400 Bad Request (invalid UUID):**
```json
{
  "error": "Invalid task ID format",
  "code": "VALIDATION_ERROR",
  "timestamp": "...",
  "path": "...",
  "requestId": "..."
}
```

**DELETE /api/v1/tasks/:id → 500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "timestamp": "...",
  "path": "...",
  "requestId": "..."
}
```

### Testing Infrastructure Reference

- Tests run via: `pnpm --filter backend test:integration`
- Config: `packages/backend/vitest.integration.config.ts` — includes `tests/integration/**/*.test.ts`
- Use `vi.spyOn(app.prisma.task, 'delete').mockRejectedValueOnce(...)` to test AC4 (DB error), then `spy.mockRestore()` before DB assertions
- Place the spy test last in the describe block to avoid `vi.restoreAllMocks()` / mock restoration issues (see Story 3.1 Debug Log)
- For 204 response: `response.payload` may be `''` or empty string; `response.json()` may throw on empty. Use `expect(response.statusCode).toBe(204)` and optionally `expect(response.payload).toBe('')` or avoid parsing body.

### Learnings from Story 3.1

- UUID validation via `uuidParamSchema` is required for all `:id` routes — malformed IDs return 400, not 500
- `PrismaClientKnownRequestError` with code `P2025` applies to both `update` and `delete`
- Integration test structure: `beforeAll` buildApp, `afterEach` restoreAllMocks, `afterAll` close
- Spy tests that mock Prisma methods should run last to avoid restoration issues affecting subsequent tests
- `TaskNotFoundError` message format is `"Task not found: {id}"`; tests use `.toContain('Task not found')`

### Architecture References

- [Source: epics.md / Story 3.2 AC1-4] Full acceptance criteria
- [Source: architecture / ARCH-3] API Spec: `DELETE /api/v1/tasks/:id` — deletes a single task
- [Source: Story 3.1] PATCH handler pattern, uuidParamSchema, TaskNotFoundError, P2025 handling

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Debug Log References

### Completion Notes List

- AC1: Added `DELETE /api/v1/tasks/:id` handler; returns 204 No Content with empty body; task permanently removed via `prisma.task.delete`.
- AC2: Catches P2025 and throws `TaskNotFoundError(id)` → 404.
- AC3: Verified via integration test: delete one of two tasks, GET all, deleted absent and other present.
- AC4: Generic re-throw for non-P2025 errors; global handler returns 500; task verified unchanged in DB after spy test.
- UUID validation via `uuidParamSchema` returns 400 for malformed ids.
- All 30 integration tests pass (7 new + 23 existing). Backend unit tests pass.
- Code review fixes: `idParsed.data` used after UUID validation in both PATCH and DELETE handlers (consistent safe pattern); added COMPLETED task deletion test; added double-delete idempotency test; removed redundant body assertion; added route ordering comment.

### File List

- packages/backend/src/routes/tasks.ts (modified — added `DELETE /tasks/:id` handler; code review: use `idParsed.data` in PATCH and DELETE handlers; added route ordering comment)
- packages/backend/tests/integration/tasks.delete.test.ts (created/modified — 7 integration tests: 5 original ACs + COMPLETED task deletion + double-delete idempotency)

### Change Log

- Story 3.2 implementation complete: added `DELETE /api/v1/tasks/:id` route with UUID validation, P2025 handling, 204 response, and 5 integration tests (Date: 2026-02-19)
- Code review pass 1: added COMPLETED task deletion test, removed redundant `response.body` assertion, added route ordering comment in tasks.ts (Date: 2026-02-19)
- Code review pass 2: used `idParsed.data` (validated value) in both PATCH and DELETE Prisma calls and error throws; added double-delete idempotency test; updated story doc counts (Date: 2026-02-19)
