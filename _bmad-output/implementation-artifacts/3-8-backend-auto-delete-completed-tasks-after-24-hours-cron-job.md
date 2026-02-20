# Story 3.8: Backend - Auto-Delete Completed Tasks After 24 Hours (Cron Job)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,  
I want completed tasks to automatically delete after 24 hours,  
so that my list stays clean without manual maintenance (ephemeral storage model).

## Acceptance Criteria

1. **Given** a task was completed 25 hours ago (completedAt timestamp is older than 24 hours)  
   **When** the automated cleanup job runs  
   **Then** the task is permanently deleted from the database  
   **And** Pino logs the deletion with task ID and completedAt timestamp
2. **Given** a task was completed 12 hours ago (within 24-hour window)  
   **When** the automated cleanup job runs  
   **Then** the task remains in the database unchanged  
   **And** the task is not deleted
3. **Given** 15 tasks were completed more than 24 hours ago and 5 tasks completed within 24 hours  
   **When** the automated cleanup job runs  
   **Then** exactly 15 tasks are deleted  
   **And** the 5 recent completed tasks remain  
   **And** Pino logs summary: `"Auto-deleted 15 completed tasks older than 24 hours"`
4. **Given** the cleanup job is configured as a scheduled task (cron job)  
   **When** the backend server starts  
   **Then** the job is scheduled to run every 1 hour (configurable interval)  
   **And** Pino logs indicate the job is registered: `"Cleanup job scheduled: every 1 hour"`
5. **Given** the cleanup job executes successfully  
   **When** the job completes  
   **Then** Pino logs the execution time and number of deleted tasks  
   **And** the job exits gracefully without affecting other server operations
6. **Given** the database connection fails during cleanup  
   **When** the job attempts to delete tasks  
   **Then** the job logs the error via Pino  
   **And** the job exits gracefully without crashing the server  
   **And** the job retries on the next scheduled run
7. **Given** no tasks are older than 24 hours  
   **When** the cleanup job runs  
   **Then** no tasks are deleted  
   **And** Pino logs: `"Auto-cleanup completed: 0 tasks deleted"`

## Tasks / Subtasks

- [x] **Task 1: Add cleanup job logic module** (AC1, AC2, AC3, AC5, AC6, AC7)
  - [x] Create `packages/backend/src/jobs/autoDeleteCompletedTasks.ts`
  - [x] Implement a pure/executable function that deletes `COMPLETED` tasks with `completedAt < now - 24h`
  - [x] Return deletion metadata (`deletedCount`, execution time) for logging
  - [x] Ensure null `completedAt` values are not deleted accidentally
  - [x] Catch and log failures without throwing uncaught errors to process level

- [x] **Task 2: Add cron scheduler bootstrap** (AC4, AC5, AC6)
  - [x] Create `packages/backend/src/jobs/autoDeleteScheduler.ts`
  - [x] Use existing `node-cron` dependency to register scheduler
  - [x] Default schedule to hourly (`0 * * * *`), with env-configurable cron expression
  - [x] Log scheduler registration message with resolved interval
  - [x] Run cleanup callback and log summary on each run

- [x] **Task 3: Wire scheduler into backend startup lifecycle** (AC4, AC5, AC6)
  - [x] Integrate scheduler startup in `packages/backend/src/index.ts` (or app bootstrap layer used by server runtime)
  - [x] Ensure scheduler has access to Prisma client from Fastify app context
  - [x] Ensure scheduler is stopped on app shutdown / process termination path
  - [x] Keep failure isolation: cron job errors must not stop HTTP server

- [x] **Task 4: Extend configuration for interval control** (AC4)
  - [x] Add optional cron schedule env var in `packages/backend/src/config/envSchema.ts` (e.g., `AUTO_DELETE_CRON`)
  - [x] Parse and surface it through `env.ts`
  - [x] Keep default behavior aligned to hourly run if env var is absent
  - [x] Document intended default in code comments where scheduler initializes

- [x] **Task 5: Add/extend tests for cleanup behavior and scheduling** (AC1–AC7)
  - [x] Add unit tests for 24-hour cutoff logic (older than 24h deleted, newer retained)
  - [x] Add test that mixed datasets delete only matching old-completed records
  - [x] Add test that DB failure logs error and does not crash flow
  - [x] Add test for scheduler registration/logging and callback invocation path
  - [x] Ensure integration-level confidence by validating DB state after cleanup execution

- [x] **Task 6: Validate story quality gates**
  - [x] Run `pnpm --filter backend test`
  - [x] Run `pnpm --filter backend lint`
  - [x] Run `pnpm --filter backend type-check`

## Dev Notes

### Story Context Intelligence

- Story 3.3 already implemented manual bulk deletion (`DELETE /api/v1/tasks/completed`) in `packages/backend/src/routes/tasks.ts`. Reuse query patterns and response/logging style rather than inventing new persistence flows.
- Story 3.7 tightened expectations around task-lifecycle cleanup behavior and explicit AC-to-test traceability. Keep test mapping explicit for each AC in this backend story.
- This story introduces **automated** cleanup only; do not regress or remove manual clear-completed endpoint behavior from Story 3.3.

### Technical Requirements

- Existing stack already includes required scheduler dependency:
  - `node-cron` in `packages/backend/package.json`
  - `@types/node-cron` already installed
- Task data model already has the required fields:
  - `status` enum (`ACTIVE`, `COMPLETED`)
  - `completedAt` nullable timestamp in Prisma schema
- Deletion cutoff must be based on `completedAt` age and be strictly older than 24 hours.
- Error handling must use existing centralized logging style (`request/app logs via Pino`) and never crash server runtime.

### Architecture Compliance

- Backend structure currently centers on:
  - startup: `packages/backend/src/index.ts`
  - app assembly: `packages/backend/src/app.ts`
  - routes: `packages/backend/src/routes/*.ts`
  - config: `packages/backend/src/config/*.ts`
  - utilities: `packages/backend/src/utils/*.ts`
- Add background-job modules under a dedicated folder (`packages/backend/src/jobs/`) to avoid bloating route modules.
- Reuse Prisma access from app context (`fastify.prisma`) and existing logger setup (`loggerConfig`/Fastify logger).

### Library / Framework Requirements

- Runtime: Fastify 4+, Prisma, PostgreSQL 16+
- Scheduling: `node-cron` (already present; no new dependency required)
- Validation: existing Zod config pattern in `envSchema.ts`
- Logging: existing Pino/Fastify logging conventions

### File Structure Requirements

- **Create**
  - `packages/backend/src/jobs/autoDeleteCompletedTasks.ts`
  - `packages/backend/src/jobs/autoDeleteScheduler.ts`
  - Test file(s) for job/scheduler logic (prefer colocated `*.test.ts` in `src/jobs` and/or integration coverage in `tests/integration`)
- **Modify**
  - `packages/backend/src/index.ts` (or equivalent bootstrap point for starting/stopping scheduler)
  - `packages/backend/src/config/envSchema.ts`
  - `packages/backend/src/config/env.ts` (if needed for typed exposure only)
- **Do not modify unless required**
  - Existing task route contracts and response schemas from Stories 3.1–3.3

### Testing Requirements

- Follow existing backend test patterns:
  - Integration tests using `buildApp()` and `app.inject(...)`
  - DB assertions via `getTestPrisma()` helper
  - `vi.spyOn` for failure-path simulation and logging assertions
- Add deterministic cutoff tests using controlled timestamps (avoid flaky `Date.now()` dependence).
- Ensure failure tests prove graceful behavior (error logged, server remains usable, job can run again later).
- Keep tests aligned with AC IDs in test names/comments.

### Previous Story Intelligence (3.7)

- Recent stories required stronger behavioral assertions than simple “request called” checks. For this story, verify actual DB state transitions and scheduled-job registration behavior explicitly.
- Keep completion notes and file list accurate and exhaustive to pass adversarial code-review checks.

### Project Structure Notes

- The repo uses pnpm workspaces (`packages/backend`, `packages/frontend`, `packages/shared`) and is **not** an Nx workspace.
- Maintain existing naming/style conventions (TypeScript strict mode, ESLint clean, typed responses/logging).

### References

- Story source and ACs: [Source: _bmad-output/planning-artifacts/epics.md#Story-3.8]
- Existing manual bulk-delete route: [Source: packages/backend/src/routes/tasks.ts]
- Backend startup and app composition: [Source: packages/backend/src/index.ts], [Source: packages/backend/src/app.ts]
- Env validation pattern: [Source: packages/backend/src/config/envSchema.ts], [Source: packages/backend/src/config/env.ts]
- Prisma task model (`completedAt`, status enum): [Source: packages/backend/prisma/schema.prisma]

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium

### Debug Log References

None — all tests and quality gates passed on first run.

### Completion Notes List

- Created `autoDeleteCompletedTasks` function: 2-step approach (findMany → deleteMany by ID) for per-task logging + atomic bulk delete
- Logs per-task info (`taskId`, `completedAt`) to satisfy AC1; summary log for AC3 ("Auto-deleted N completed tasks older than 24 hours") and AC7 ("Auto-cleanup completed: 0 tasks deleted")
- Null `completedAt` safety ensured via Prisma filter `{ not: null, lt: cutoffDate }`; tasks with null completedAt are never matched
- All errors caught inside the job function; returns `{ deletedCount: 0, executionTimeMs }` on failure (AC6 graceful degradation)
- Created `autoDeleteScheduler`: registers node-cron with `'0 * * * *'` default (env-configurable via `AUTO_DELETE_CRON`); logs "Cleanup job scheduled: every 1 hour" (AC4)
- Added `AUTO_DELETE_CRON` optional env var to `envSchema.ts`
- Wired scheduler into `packages/backend/src/index.ts`: start after `buildApp()`, stop via `app.addHook('onClose')`, graceful shutdown on SIGTERM/SIGINT; scheduler errors don't crash HTTP server
- 8 unit tests in `autoDeleteCompletedTasks.test.ts` covering all ACs with mocked Prisma/logger
- 4 unit tests in `autoDeleteScheduler.test.ts` with mocked node-cron and autoDeleteCompletedTasks
- 7 integration tests in `tests/integration/jobs.autoDelete.test.ts` validating actual DB state via testcontainers
- 33/33 unit tests pass, 8/8 integration test files pass, 100% coverage on new job files, lint clean, type-check clean
- Review fixes: `deletedCount` now uses actual `deleteMany().count` and delete predicate re-validates status/cutoff to avoid stale-snapshot over-reporting
- Review fixes: scheduler registration log now reflects resolved interval (default fixed message for hourly; custom cron expression logged verbatim)
- Review fixes: `AUTO_DELETE_CRON` is validated in `envSchema` via `node-cron` parser to fail invalid config at startup parse time
- Review fixes: added strict 24h boundary tests and scheduler execution-path integration coverage

### File List

- `packages/backend/src/jobs/autoDeleteCompletedTasks.ts` — CREATED
- `packages/backend/src/jobs/autoDeleteScheduler.ts` — CREATED
- `packages/backend/src/jobs/autoDeleteCompletedTasks.test.ts` — CREATED (8 unit tests)
- `packages/backend/src/jobs/autoDeleteScheduler.test.ts` — CREATED (4 unit tests)
- `packages/backend/tests/integration/jobs.autoDelete.test.ts` — CREATED (7 integration tests)
- `packages/backend/tests/integration/jobs.scheduler.test.ts` — CREATED (scheduler execution path integration)
- `packages/backend/src/config/env.test.ts` — MODIFIED (AUTO_DELETE_CRON validation tests)
- `packages/backend/tests/integration/jobs.autoDelete.test.ts` — MODIFIED (boundary and AC7 robustness)
- `packages/backend/src/config/envSchema.ts` — MODIFIED (added AUTO_DELETE_CRON)
- `packages/backend/src/index.ts` — MODIFIED (scheduler wiring, graceful shutdown)
- `_bmad-output/implementation-artifacts/3-8-backend-auto-delete-completed-tasks-after-24-hours-cron-job.md` — MODIFIED (story progress)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — MODIFIED (story status)

### Change Log

| Date | Change |
|------|--------|
| 2026-02-18 | Story created |
| 2026-02-18 | Implemented all tasks: job module, cron scheduler, env config, index wiring, 12 unit tests + 7 integration tests; 29 unit tests pass, lint/type-check clean |
| 2026-02-20 | Code review fixes applied: corrected delete count source, improved scheduler interval logging, added cron-expression validation, and expanded boundary/scheduler integration tests |

## Senior Developer Review (AI)

### Reviewer

Pregno

### Date

2026-02-20

### Outcome

Approved after fixes

### Findings Resolved

- Switched deletion reporting from pre-delete snapshot size to actual `deleteMany().count` to prevent over-reporting under concurrent updates
- Made scheduler registration logs reflect the resolved interval for custom cron expressions while preserving the exact hourly default message
- Added `AUTO_DELETE_CRON` schema validation so invalid cron expressions are rejected during env parsing
- Added strict 24-hour cutoff boundary coverage and scheduler execution-path integration coverage
