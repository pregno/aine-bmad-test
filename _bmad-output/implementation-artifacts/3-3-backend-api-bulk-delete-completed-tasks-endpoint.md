# Story 3.3: Backend API - Bulk Delete Completed Tasks Endpoint

Status: done

## Story

As a user,
I want the backend to delete all completed tasks in a single operation,
so that I can quickly clear my completed task history.

## Acceptance Criteria

1. **[AC1] 200 OK with deletedCount on successful bulk delete** — Given the database contains 5 active tasks and 12 completed tasks, when I send `DELETE /api/v1/tasks/completed`, then the response has status 200 OK, the response body contains `{ "deletedCount": 12 }`, all 12 completed tasks are permanently removed from the database, and all 5 active tasks remain unchanged.

2. **[AC2] 200 OK with deletedCount 0 when no completed tasks exist** — Given the database contains only active tasks (no completed tasks), when I send `DELETE /api/v1/tasks/completed`, then the response has status 200 OK, the response body contains `{ "deletedCount": 0 }`, and all active tasks remain unchanged.

3. **[AC3] 500 and no data corruption on DB failure** — Given the database connection fails during bulk deletion, when I send the delete completed request, then the response has status 500 Internal Server Error, Pino logs the error, and completed tasks remain in the database (no partial deletion).

## Tasks / Subtasks

- [x] **Task 1: Add `DELETE /tasks/completed` route to the existing `taskRoutes` plugin** (AC: 1, 2, 3)
  - [x] Add `fastify.delete('/tasks/completed', ...)` inside the existing `taskRoutes` function in `packages/backend/src/routes/tasks.ts`
  - [x] **🔴 CRITICAL — Place this route BEFORE `DELETE /tasks/:id`** (see Dev Notes for why)
  - [x] Call `fastify.prisma.task.deleteMany({ where: { status: 'COMPLETED' } })` — returns `{ count: N }`
  - [x] Return `reply.status(200).send({ deletedCount: result.count })` using `DeleteCompletedResponse` type from `@aine/shared`
  - [x] No request body, no UUID validation — this route has no path parameters
  - [x] Re-throw any errors (global error handler returns 500, Pino logs via error handler)
  - [x] Remove the `// IMPORTANT (Story 3.3)` comment on the existing `DELETE /tasks/:id` route (it was a forward reference; the work is now done here)
  - [x] Import `DeleteCompletedResponse` from `@aine/shared` (already in the package, already exported)

- [x] **Task 2: Write integration tests** (AC: 1, 2, 3)
  - [x] Create `packages/backend/tests/integration/tasks.clear-completed.test.ts`
  - [x] Follow the exact same structure as `tasks.delete.test.ts`:
    - `beforeAll`: `buildApp()` + `app.ready()`
    - `afterEach`: `vi.restoreAllMocks()`
    - `afterAll`: `app.close()`
    - Use `app.inject()` for HTTP requests
    - Use `getTestPrisma()` for direct DB assertions
  - [x] Test AC1: Create 3 active + 2 completed tasks via Prisma, DELETE /tasks/completed, assert 200 + `{ deletedCount: 2 }`, assert 2 completed gone from DB, assert 3 active remain via `findMany`
  - [x] Test AC2: Create 3 active-only tasks, DELETE /tasks/completed, assert 200 + `{ deletedCount: 0 }`, assert all 3 active remain
  - [x] Test empty DB: DELETE /tasks/completed on empty DB, assert 200 + `{ deletedCount: 0 }`
  - [x] Test GET after bulk delete: Create mixed tasks, DELETE /tasks/completed, GET /tasks, assert only active tasks are in response
  - [x] Test AC3 (DB failure spy, placed LAST): Mock `fastify.prisma.task.deleteMany` to throw → 500 with `{ error: "Internal server error" }`; restore spy; assert completed tasks still in DB

## Dev Notes

### 🔴 CRITICAL: Route Ordering in `tasks.ts`

**The `DELETE /tasks/completed` handler MUST be registered BEFORE `DELETE /tasks/:id`.**

Fastify matches routes in registration order. If `DELETE /tasks/:id` is registered first, a request to `DELETE /tasks/completed` will be matched with `id = "completed"`. Since `"completed"` is not a valid UUID, `uuidParamSchema.safeParse("completed")` fails and a 400 `VALIDATION_ERROR` is returned — never reaching the bulk delete handler.

The current `tasks.ts` already has a forward-reference comment at the `DELETE /tasks/:id` handler:
```
// IMPORTANT (Story 3.3): When adding DELETE /tasks/completed for bulk delete,
// register that route BEFORE this one — otherwise ':id' will match the literal "completed".
```

Insert `DELETE /tasks/completed` **above** `DELETE /tasks/:id`, then remove that comment (the work is done).

**Final route registration order in `taskRoutes`:**
1. `GET /tasks`
2. `POST /tasks`
3. `PATCH /tasks/:id`
4. `DELETE /tasks/completed`   ← NEW (Story 3.3) — MUST be before :id
5. `DELETE /tasks/:id`          ← existing (Story 3.2)

### Architecture Constraints

- **Do NOT create a new route file.** Add the handler inside the existing `taskRoutes` plugin in `packages/backend/src/routes/tasks.ts`. All task routes live in this single file/plugin.
- **`DeleteCompletedResponse` is already in `@aine/shared`.** It's defined in `packages/shared/src/types/api.ts` and exported from the root index. Just import it:
  ```typescript
  import type { ..., DeleteCompletedResponse } from '@aine/shared';
  ```
- **`prisma.task.deleteMany` does NOT throw P2025** for zero matches. It succeeds with `{ count: 0 }`. No special empty-result handling needed.
- **No UUID validation.** This route has no path parameter — there is nothing to validate on the request.
- **No request body.** Do not parse `request.body`. The route handler signature is `async (_request, reply)`.
- **200 OK (not 204).** The response has a body (`{ deletedCount: N }`), so it must be 200, not 204.

### Project Structure Notes

```
packages/
  backend/
    src/
      routes/
        tasks.ts            ← MODIFY: add DELETE /tasks/completed BEFORE DELETE /tasks/:id
      schemas/
        tasks.ts            ← No changes
    tests/
      integration/
        tasks.clear-completed.test.ts  ← CREATE new integration test file
```

### Key Implementation Pattern

Insert this block ABOVE the `DELETE /tasks/:id` handler (and remove the TODO comment):

```typescript
fastify.delete('/tasks/completed', async (_request, reply) => {
  const result = await fastify.prisma.task.deleteMany({
    where: { status: 'COMPLETED' },
  });
  const response: DeleteCompletedResponse = { deletedCount: result.count };
  return reply.status(200).send(response);
});
```

No try/catch is needed here: there are no specific Prisma error codes to handle (unlike `delete` → P2025). Any unexpected DB error will propagate to Fastify's global error handler, which returns 500 and logs via Pino automatically.

### Response Shape Reference

**DELETE /api/v1/tasks/completed → 200 OK:**
```json
{ "deletedCount": 12 }
```
```typescript
// From @aine/shared:
export interface DeleteCompletedResponse {
  deletedCount: number;
}
```

**DELETE /api/v1/tasks/completed → 500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "timestamp": "...",
  "path": "/api/v1/tasks/completed",
  "requestId": "..."
}
```

### Testing Infrastructure Reference

- Tests run via: `pnpm --filter backend test:integration`
- Config: `packages/backend/vitest.integration.config.ts` — includes `tests/integration/**/*.test.ts`
- Use `vi.spyOn(app.prisma.task, 'deleteMany').mockRejectedValueOnce(...)` for AC3 (DB error)
- Place the spy test **last** to avoid mock leakage (established pattern from Stories 3.1 and 3.2)
- Use `getTestPrisma()` for `findMany` assertions after the route call
- Each test creates its own tasks — no shared state assumptions needed (Testcontainers gives a clean DB per suite)

### Test Data Pattern for AC1

```typescript
it('returns 200 with deletedCount and removes only completed tasks (AC1)', async () => {
  const prisma = getTestPrisma();

  // Create 3 active + 2 completed
  const active = await Promise.all([
    prisma.task.create({ data: { text: 'Active A', status: 'ACTIVE' } }),
    prisma.task.create({ data: { text: 'Active B', status: 'ACTIVE' } }),
    prisma.task.create({ data: { text: 'Active C', status: 'ACTIVE' } }),
  ]);
  await Promise.all([
    prisma.task.create({ data: { text: 'Completed X', status: 'COMPLETED', completedAt: new Date() } }),
    prisma.task.create({ data: { text: 'Completed Y', status: 'COMPLETED', completedAt: new Date() } }),
  ]);

  const response = await app.inject({
    method: 'DELETE',
    url: '/api/v1/tasks/completed',
  });

  expect(response.statusCode).toBe(200);
  const body = response.json<{ deletedCount: number }>();
  expect(body.deletedCount).toBe(2);

  const remaining = await prisma.task.findMany();
  expect(remaining).toHaveLength(3);
  const remainingIds = remaining.map((t) => t.id);
  expect(remainingIds).toContain(active[0].id);
  expect(remainingIds).toContain(active[1].id);
  expect(remainingIds).toContain(active[2].id);
  const statuses = remaining.map((t) => t.status);
  expect(statuses.every((s) => s === 'ACTIVE')).toBe(true);
});
```

### Learnings from Stories 3.1 and 3.2

- Spy tests that mock Prisma methods must run **last** in the describe block
- `afterEach(() => vi.restoreAllMocks())` is the standard cleanup — also manually call `spy.mockRestore()` before any DB assertions inside the spy test
- `prisma.task.deleteMany` is the correct Prisma method for batch deletes; it returns `{ count: N }` — access as `result.count`
- **`deleteMany` never throws P2025** — zero matches is a valid success (count = 0)
- Integration tests use `getTestPrisma()` for direct DB access; `app.prisma` is the Fastify-decorated instance for mocking

### Architecture References

- [Source: epics.md / Story 3.3 AC1-3] Full acceptance criteria
- [Source: architecture / ARCH-3] API Spec: `DELETE /api/tasks/completed` — returns `{ deletedCount: N }`
- [Source: architecture / Backend Architecture] Route registration pattern in `taskRoutes`
- [Source: packages/shared/src/types/api.ts] `DeleteCompletedResponse` already defined
- [Source: Story 3.2 Dev Notes] Route ordering warning (forward reference now to be resolved here)

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Debug Log References

### Completion Notes List

- AC1: Added `DELETE /api/v1/tasks/completed` handler; returns 200 OK with `{ deletedCount: N }`; all completed tasks permanently removed via `prisma.task.deleteMany({ where: { status: 'COMPLETED' } })`.
- AC2: `deleteMany` returns `{ count: 0 }` on zero matches — no special handling required; test confirms 200 + `{ deletedCount: 0 }`.
- AC3: Errors propagate to global Fastify error handler returning 500; verified via `vi.spyOn(app.prisma.task, 'deleteMany').mockRejectedValueOnce(...)` and explicit log assertion through a request logger spy.
- Route ordering: `DELETE /tasks/completed` registered at line 107, BEFORE `DELETE /tasks/:id` at line 115 — prevents "completed" matching `:id` param.
- Removed the Story 3.3 forward-reference comment from `DELETE /tasks/:id` handler.
- Added an edge-case integration test for all-completed datasets (all tasks removed, `deletedCount` matches full set).
- Renamed a misleading test description so behavior and assertion intent match.
- All 36 integration tests pass (6 new + 30 existing). Zero regressions.

### File List

- packages/backend/src/routes/tasks.ts (modified — added `DELETE /tasks/completed` handler before `DELETE /tasks/:id`; added `DeleteCompletedResponse` import; removed forward-reference comment)
- packages/backend/tests/integration/tasks.clear-completed.test.ts (created/modified — 6 integration tests covering AC1, AC2, AC3, empty DB, GET verification, and all-completed edge case; includes explicit error logging assertion for AC3)

### Change Log

- Story 3.3 implementation complete: added `DELETE /api/v1/tasks/completed` route with `deleteMany`, 200 response, and 5 integration tests (Date: 2026-02-19)
- Code review fixes: validated AC3 logging in integration test, added all-completed edge-case test, and corrected misleading test name (Date: 2026-02-19)
