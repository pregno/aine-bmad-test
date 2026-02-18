# Story 2.5: TanStack Query Integration with Optimistic Updates

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want task creation to feel instant even with slow network connections,
so that I never wait for server confirmation during meetings.

## Acceptance Criteria

**AC1 — Immediate optimistic task creation**
- **Given** TanStack Query is configured in the frontend
- **When** I create a new task
- **Then** the task appears in the list immediately with a temporary ID
- **And** the background POST request to `/api/v1/tasks` executes asynchronously
- **And** no loading spinner blocks the UI

**AC2 — Temp ID replacement on success**
- **Given** the backend successfully creates the task
- **When** the POST response returns with the real task ID
- **Then** the temporary ID is replaced with the real UUID from the server
- **And** the task remains in the same position in the list
- **And** no UI flicker or re-render is visible to the user

**AC3 — Rollback and retry affordance on failure**
- **Given** the backend request fails (network error, 500 status)
- **When** TanStack Query receives the error
- **Then** the optimistically added task is removed from the list
- **And** an error toast appears: "Failed to create task. Try again?"
- **And** the toast includes a "Retry" button that re-attempts the POST request

**AC4 — Rapid creates remain stable**
- **Given** I create multiple tasks in rapid succession (3 tasks within 10 seconds)
- **When** all tasks are created
- **Then** all 3 tasks appear in the list immediately (optimistic UI)
- **And** all 3 background POST requests execute concurrently
- **And** tasks are replaced with real IDs as responses arrive
- **And** the list maintains correct sort order throughout

**AC5 — Refresh fetches persisted server data**
- **Given** TanStack Query cache is configured
- **When** I create a task and then refresh the page
- **Then** the task persists (fetched from server, not just local cache)
- **And** the `GET /api/v1/tasks` query executes on page load
- **And** the task list displays server data

## Tasks / Subtasks

- [x] Task 1: Add TanStack Query provider setup (AC1, AC5)
  - [x] Create a frontend query client module (for shared configuration and query keys)
  - [x] Wrap app root with `QueryClientProvider` in `packages/frontend/src/main.tsx`
  - [x] Keep existing `ThemeProvider`, `CssBaseline`, and `BrowserRouter` behavior unchanged

- [x] Task 2: Implement query hooks for tasks (AC1, AC5)
  - [x] Add `useTasksQuery` hook using `useQuery` and existing `fetchTasks` API client
  - [x] Define stable query key(s), e.g., `['tasks']`
  - [x] Ensure first page load behavior still handles loading, empty, and load-error states

- [x] Task 3: Implement optimistic create mutation with rollback (AC1, AC2, AC3, AC4)
  - [x] Add `useCreateTaskMutation` hook using `useMutation`
  - [x] In `onMutate`, cancel outgoing task refetches and optimistically prepend temp task
  - [x] Generate deterministic temp IDs (prefix `temp-`) and preserve created order
  - [x] In `onSuccess`, replace temp task with server task by temp ID mapping
  - [x] In `onError`, rollback optimistic task and expose retry callback/state
  - [x] In `onSettled`, ensure cache consistency (invalidate or direct cache reconciliation)

- [x] Task 4: Refactor `HomePage` to use query + mutation path (AC1-AC5)
  - [x] Replace `loadTasks`/manual fetch state with query-driven state where appropriate
  - [x] Keep existing FAB + dialog interaction and validation behavior from Story 2.4
  - [x] Wire dialog submit to mutation; remove duplicated create side-effects from component
  - [x] Add non-blocking toast error with exact message `"Failed to create task. Try again?"`
  - [x] Add `"Retry"` action in toast that retries failed create without retyping

- [x] Task 5: Testing coverage for optimistic flow (AC1-AC5)
  - [x] Add/update component tests to verify immediate optimistic row insertion
  - [x] Add/update tests for server success temp->real ID replacement
  - [x] Add/update tests for rollback + toast + retry behavior
  - [x] Add/update tests for rapid multiple creates preserving visible order
  - [x] Add/update tests for refresh loading from server state (not only local optimistic cache)

- [x] Task 6: Verification and quality checks
  - [x] Run `pnpm --filter frontend lint`
  - [x] Run `pnpm --filter frontend test`
  - [x] Confirm no regression in Story 2.4 ACs (dialog open, validation, cancel/escape)
  - [x] Update story Dev Agent Record after implementation

## Dev Notes

### Developer Context Section

This story intentionally upgrades task creation from local `useState` optimistic handling (Story 2.4) to TanStack Query v5 cache-driven optimistic mutations. The key goal is to preserve current UX while moving source-of-truth orchestration into query/mutation hooks.

### Technical Requirements

- Use existing API clients in `packages/frontend/src/api/tasks.ts` (`fetchTasks`, `createTask`)
- Keep endpoint contract unchanged: `POST {BASE_URL}/tasks` returning `{ task }`
- Keep temp task shape compatible with shared `Task` type from `@aine/shared`
- Preserve 5-second capture flow: no blocking spinner during create
- Retry action must be user-triggered from toast for failed create operations

### Architecture Compliance

- Use `@tanstack/react-query` v5 patterns (`QueryClientProvider`, `useQuery`, `useMutation`)
- Maintain existing React + MUI architecture (no new state management library)
- Reuse current component boundaries where practical (`HomePage`, `AddTaskDialog`)
- Avoid breaking established Story 2.4 behavior and tests
- Keep frontend-only concern in `packages/frontend`; no backend API contract changes

### Library / Framework Requirements

- TanStack Query v5 is already present in `packages/frontend/package.json`
- Use mutation lifecycle callbacks aligned with v5 docs:
  - `onMutate`: optimistic cache update + cancel refetches
  - `onError`: rollback using context from `onMutate`
  - `onSettled`: reconcile/invalidate tasks query
- Root setup must use `QueryClientProvider` with a single app-level `QueryClient`

### File Structure Requirements

Target files (expected):
- `packages/frontend/src/main.tsx` - wrap app with `QueryClientProvider`
- `packages/frontend/src/components/HomePage.tsx` - consume query + mutation hooks
- `packages/frontend/src/components/HomePage.test.tsx` - optimistic create + rollback + retry tests

Likely new files:
- `packages/frontend/src/lib/queryClient.ts` (or equivalent) - query client setup
- `packages/frontend/src/hooks/useTasksQuery.ts` - tasks query hook
- `packages/frontend/src/hooks/useCreateTaskMutation.ts` - optimistic create mutation hook

Follow existing conventions:
- Keep naming consistent with current code style
- Keep tests in component-local test files unless a hook-specific test is clearer

### Testing Requirements

- Cover optimistic insert timing (task visible before POST resolves)
- Cover success replacement (temp ID replaced with real ID without reorder flicker)
- Cover failure rollback + toast visibility + retry action
- Cover rapid parallel creates (3 creates) with stable top ordering behavior
- Keep existing Story 2.4 tests passing (13+ tests currently)

### Previous Story Intelligence

From Story 2.4 implementation:
- `HomePage` currently performs manual optimistic update in component state
- `AddTaskDialog` behavior is stable and already tested (validation, Enter, Cancel, Escape)
- Tests require cleanup discipline and query scoping to avoid DOM leakage
- `createTask` request/response typing and UX strings were recently corrected

Actionable guidance:
- Migrate create optimism from component state into mutation cache logic; do not duplicate both paths
- Preserve existing dialog component semantics; this story is data-flow/state layer focused
- Keep AC strings and behaviors stable to avoid regression churn

### Git Intelligence Summary

Recent commit pattern indicates story-scoped delivery with focused frontend modifications:
- `story: 2.4` touched `HomePage`, `AddTaskDialog`, `tasks.ts`, and `HomePage.test.tsx`
- Use same touch points for 2.5 unless creating dedicated hooks/lib improves clarity

### Latest Tech Information

Current TanStack Query v5 guidance (official docs):
- Prefer optimistic updates via `onMutate` with rollback context passed to `onError`
- Cancel outgoing refetches before optimistic cache writes to avoid overwrite races
- Use `onSettled` to invalidate/reconcile server truth after mutation finishes
- Use a single `QueryClientProvider` root setup for app-wide cache consistency

### Project Context Reference

- No `project-context.md` file was found in this repository

### References

- Story 2.5 requirements and ACs: [Source: _bmad-output/planning-artifacts/epics.md#Story-25-TanStack-Query-Integration-with-Optimistic-Updates]
- API contract and architecture baseline: [Source: _bmad-output/planning-artifacts/technical-architecture-aine-bmad-test-2026-02-17.md#API-Specifications]
- UX constraints for instant interactions: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Core-User-Experience]
- Previous implementation learnings: [Source: _bmad-output/implementation-artifacts/2-4-frontend-task-creation-via-fab-and-dialog-5-second-flow.md]
- TanStack Query v5 optimistic updates: [Source: https://tanstack.com/query/v5/docs/react/guides/optimistic-updates]
- QueryClientProvider setup: [Source: https://tanstack.com/query/v5/docs/framework/react/reference/QueryClientProvider]

## Dev Agent Record

### Agent Model Used

gpt-5.3-codex

### Debug Log References

- Story creation workflow execution logs (Cursor session)

### Completion Notes List

- Added TanStack Query root setup via `QueryClientProvider` in `main.tsx` using a shared query client module
- Added `useTasksQuery` and `useCreateTaskMutation` hooks with optimistic create, deterministic temp IDs, success replacement, and rollback on error
- Refactored `HomePage` to query/mutation-driven state and added create-failure error toast with `"Retry"` action
- Expanded `HomePage` tests to cover rollback+retry, rapid multi-create ordering, and persisted-data reload behavior
- Applied code-review fixes: per-mutation rollback safety, explicit `onSettled` cache consistency, and resilient list rendering after query errors
- Strengthened tests for out-of-order concurrent create responses and isolated rollback under overlapping create requests
- Validated full frontend quality gates after review fixes: lint pass and all tests passing (29/29)

### File List

- `_bmad-output/implementation-artifacts/2-5-tanstack-query-integration-with-optimistic-updates.md` — MODIFIED (task completion/status/records)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — MODIFIED (story status sync)
- `packages/frontend/src/lib/queryClient.ts` — NEW
- `packages/frontend/src/hooks/useTasksQuery.ts` — NEW
- `packages/frontend/src/hooks/useCreateTaskMutation.ts` — NEW
- `packages/frontend/src/main.tsx` — MODIFIED (QueryClientProvider root setup)
- `packages/frontend/src/components/HomePage.tsx` — MODIFIED (query+mutation integration, create error toast + retry)
- `packages/frontend/src/components/HomePage.test.tsx` — MODIFIED (provider setup, optimistic flow tests)

### Change Log

| Date       | Change                                                                 |
|------------|------------------------------------------------------------------------|
| 2026-02-18 | Integrated TanStack Query v5 for tasks query/mutation with optimistic create and rollback |
| 2026-02-18 | Refactored HomePage to query-driven state and added create error toast retry UX |
| 2026-02-18 | Expanded HomePage tests for optimistic flow, rollback+retry, rapid create ordering, and persisted reload |
| 2026-02-18 | Applied adversarial code review fixes for concurrent rollback isolation, onSettled reconciliation, and optimistic visibility after load errors |

## Senior Developer Review (AI)

### Outcome

Approved after fixes.

### Findings Resolved

- Fixed critical task-audit mismatch by implementing `onSettled` cache consistency in `useCreateTaskMutation`
- Fixed concurrent rollback behavior to remove only the failed mutation's optimistic task instead of reverting full snapshots
- Fixed UI behavior so optimistic tasks remain visible when task query status is error
- Added robust tests for out-of-order concurrent create responses and overlapping success/failure rollback isolation
