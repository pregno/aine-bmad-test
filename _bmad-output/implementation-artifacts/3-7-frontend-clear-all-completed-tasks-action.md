# Story 3.7: Frontend - Clear All Completed Tasks Action

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to clear all completed tasks in one action,
so that I can maintain a clean task list without individually deleting each completed task.

## Acceptance Criteria

**AC1 — Button appears in completed section**
- **Given** the completed section is expanded and contains 12 completed tasks
- **When** I see the completed section
- **Then** a "Clear All Completed" button appears at the top of the section (below the header)
- **And** the button has secondary styling (not primary color, less prominent)

**AC2 — Confirmation dialog**
- **Given** I tap "Clear All Completed"
- **When** the button is tapped
- **Then** a confirmation dialog appears: "Delete all 12 completed tasks? This cannot be undone."
- **And** the dialog shows the count of tasks to be deleted
- **And** the dialog has "Cancel" and "Clear Completed" buttons

**AC3 — Optimistic clear + background DELETE**
- **Given** the confirmation dialog is open
- **When** I tap "Clear Completed"
- **Then** the dialog closes immediately
- **And** all completed tasks fade out with staggered animation (~50ms delay between each, total ~600ms)
- **And** the completed section header updates to "Completed (0)" and disappears
- **And** a background `DELETE /api/v1/tasks/completed` request executes

**AC4 — Success handling**
- **Given** the backend successfully deletes all completed tasks
- **When** the DELETE response returns with `{ "deletedCount": 12 }`
- **Then** the UI already reflects the deletion (optimistic update)
- **And** a subtle success toast appears briefly: "12 tasks cleared"

**AC5 — Error rollback handling**
- **Given** the backend request fails
- **When** TanStack Query receives the error
- **Then** all completed tasks reappear in the completed section with fade-in animation
- **And** an error toast appears: "Failed to clear completed tasks. Try again?"

**AC6 — Button hidden when no completed tasks**
- **Given** I have no completed tasks
- **When** the completed section is not visible
- **Then** the "Clear All Completed" button does not appear anywhere in the UI

## Tasks / Subtasks

- [x] **Task 1: Add API client support for bulk clear endpoint** (AC3, AC4, AC5)
  - [x] Add `clearCompletedTasks(): Promise<{ deletedCount: number }>` to `packages/frontend/src/api/tasks.ts`
  - [x] Use `DELETE ${BASE_URL}/tasks/completed`
  - [x] Throw on non-OK responses
  - [x] Return parsed JSON as `{ deletedCount: number }`

- [x] **Task 2: Add TanStack mutation hook for bulk clear with rollback** (AC3, AC4, AC5)
  - [x] Create `packages/frontend/src/hooks/useClearCompletedTasksMutation.ts`
  - [x] Follow Story 3.5 pattern (`useDeleteTaskMutation`) with `retry: 0`
  - [x] In `onMutate`, optimistic update removes all `TaskStatus.COMPLETED` tasks from `TASKS_QUERY_KEY`
  - [x] Keep `previousTasks` in mutation context for rollback
  - [x] In `onError`, restore full prior cache
  - [x] In `onSettled`, invalidate query with `refetchType: 'none'`

- [x] **Task 3: Add clear-completed UI + dialog in `HomePage`** (AC1, AC2, AC6)
  - [x] Import and initialize `useClearCompletedTasksMutation` in `HomePage.tsx`
  - [x] Add local state for dialog open/close (`clearCompletedDialogOpen`)
  - [x] Add button below completed header with secondary styling and test id (`clear-completed-button`)
  - [x] Button appears only when `completedTasks.length > 0` **and** section is expanded
  - [x] Add dialog with dynamic count text and action buttons (`clear-completed-cancel`, `clear-completed-confirm`)

- [x] **Task 4: Implement optimistic UX + toasts + rollback fade-in support** (AC3, AC4, AC5)
  - [x] On confirm: close dialog and call mutation immediately
  - [x] Add success toast state/message: `"${deletedCount} tasks cleared"` (or singular form for 1)
  - [x] Add error toast: `"Failed to clear completed tasks. Try again?"`
  - [x] Track cleared IDs in `HomePage` and pass `fadeInOnMount` for rollback reappearance
  - [x] Ensure completed section disappears automatically when completed count reaches 0 (already tied to `completedTasks.length > 0`)

- [x] **Task 5: Add unit/integration tests in `HomePage.test.tsx`** (AC1–AC6)
  - [x] AC1: expanded completed section shows clear button with secondary-style intent
  - [x] AC2: clicking clear button opens dialog with dynamic count and both actions
  - [x] AC3: confirm triggers optimistic removal before DELETE resolves
  - [x] AC4: successful DELETE keeps section cleared and shows success toast
  - [x] AC5: failed DELETE rolls back completed tasks and shows error toast
  - [x] AC6: no completed tasks -> button absent

- [x] **Task 6: Validate story quality gates**
  - [x] Run `pnpm --filter frontend test`
  - [x] Run `pnpm --filter frontend lint`
  - [x] Run `pnpm --filter frontend type-check`

## Dev Notes

### Story Context Intelligence

- Story 3.6 introduced completed-section collapse state in `HomePage.tsx` with localStorage persistence and `Collapse`.
- Story 3.5 introduced delete mutation rollback patterns and `SwipeableTaskCard` `fadeInOnMount`.
- Story 3.7 must extend these established patterns; do not re-architect list ownership away from `HomePage`.

### Technical Requirements

- Endpoint contract is already defined by Epic 3 and backend Story 3.3:
  - `DELETE /api/v1/tasks/completed`
  - success body: `{ deletedCount: number }`
- Frontend currently uses `fetch`-based API client, not axios.
- Mutation behavior must be optimistic-first with immediate UI response and rollback on failure.
- Keep `retry: 0` for destructive operations to avoid delayed rollback behavior.

### Architecture Compliance

- Use existing React + TanStack Query patterns from:
  - `packages/frontend/src/hooks/useDeleteTaskMutation.ts`
  - `packages/frontend/src/hooks/useUpdateTaskStatusMutation.ts`
- Keep query key as `TASKS_QUERY_KEY` from `packages/frontend/src/lib/queryClient.ts`.
- Do not introduce new dependencies for animation; use existing MUI/CSS transitions only.

### Library / Framework Requirements

- UI components: Material-UI (`Button`, `Dialog`, `Snackbar`, `Alert`, etc.)
- State/mutations: `@tanstack/react-query`
- Domain types: `@aine/shared` (`Task`, `TaskStatus`)

### File Structure Requirements

- **Modify**
  - `packages/frontend/src/api/tasks.ts` (add `clearCompletedTasks`)
  - `packages/frontend/src/components/HomePage.tsx` (button, dialog, mutation integration, toasts)
  - `packages/frontend/src/components/HomePage.test.tsx` (AC1–AC6 tests)
- **Create**
  - `packages/frontend/src/hooks/useClearCompletedTasksMutation.ts`
- **Do not modify for this story unless necessary**
  - `SwipeableTaskCard.tsx` (except if a minimal extension is needed for rollback animation semantics)

### Testing Requirements

- Preserve the existing `localStorageMock` approach in `HomePage.test.tsx`.
- Add deterministic optimistic tests with deferred promises to prove "before server response" behavior.
- Ensure tests respect Story 3.6 behavior:
  - completed section collapsed by default
  - expand via `completed-section-toggle` before asserting per-card visibility
- Validate both success and rollback paths for the bulk clear mutation.

### Previous Story Intelligence (3.6)

- Completed section content is unmounted while collapsed (`Collapse ... unmountOnExit`), so assertions for completed task cards require expansion first.
- `isCompletedExpanded` is localStorage-backed (`aine-completed-expanded`); tests may need explicit setup for expanded mode.
- Existing delete/toggle tests were recently aligned to collapse behavior; follow the same pattern for bulk-clear tests.

### Project Structure Notes

- Align with current monorepo paths under `packages/frontend/src/...`.
- Continue using home-page-centered orchestration for list + feedback state.
- Keep story-scope focused; avoid introducing non-AC behavior.

### References

- Story definition and ACs: [Source: _bmad-output/planning-artifacts/epics.md#Story-3.7]
- Existing completed-section behavior: [Source: packages/frontend/src/components/HomePage.tsx]
- Existing delete optimistic/rollback pattern: [Source: packages/frontend/src/hooks/useDeleteTaskMutation.ts]
- Query key and defaults: [Source: packages/frontend/src/lib/queryClient.ts]
- API client style: [Source: packages/frontend/src/api/tasks.ts]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Added `clearCompletedTasks()` and `ClearCompletedResponse` to `packages/frontend/src/api/tasks.ts`
- Created `useClearCompletedTasksMutation` hook with optimistic update (filter COMPLETED from cache) and rollback on error
- Added "Clear All Completed" button (variant="text", color="secondary") inside Collapse, below completed header
- Added confirmation Dialog with dynamic task count and Cancel/Clear Completed actions
- Success Snackbar: "N tasks cleared" (or "1 task cleared"); error Snackbar: "Failed to clear completed tasks. Try again?"
- Rollback: `rollbackFadeTaskIds` Set for fade-in animation when DELETE fails
- 6 new tests covering AC1–AC6; all 59 tests pass, lint clean, type-check clean
- Code-review fixes: implemented real staggered optimistic removal (~50ms cadence) via timed cache updates in `useClearCompletedTasksMutation`
- Code-review fixes: prevented rollback fade-in state leakage by clearing `rollbackFadeTaskIds` at clear start and success
- Code-review fixes: strengthened AC3/AC4 tests to validate staggered disappearance and eventual cleared section state

### File List

- `packages/frontend/src/api/tasks.ts` — MODIFIED (clearCompletedTasks, ClearCompletedResponse)
- `packages/frontend/src/hooks/useClearCompletedTasksMutation.ts` — CREATED
- `packages/frontend/src/components/HomePage.tsx` — MODIFIED (button, dialog, mutation, success/error toasts, rollback IDs)
- `packages/frontend/src/components/HomePage.test.tsx` — MODIFIED (6 Story 3.7 tests)
- `_bmad-output/implementation-artifacts/3-7-frontend-clear-all-completed-tasks-action.md` — MODIFIED (story progress)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — MODIFIED (story status)

### Change Log

| Date       | Change |
|------------|--------|
| 2026-02-18 | Story created |
| 2026-02-18 | Implemented all tasks: API client, mutation hook, HomePage button/dialog/toasts, 6 tests; 59 tests pass, lint/type-check clean |
| 2026-02-18 | Code review fixes applied: staggered optimistic clear animation, rollback fade-in state cleanup, and stronger stagger validation tests |

## Senior Developer Review (AI)

### Reviewer

Pregno

### Date

2026-02-18

### Outcome

Approved after fixes

### Findings Resolved

- Implemented staggered optimistic clear behavior to satisfy AC3 animation cadence requirement
- Added explicit test coverage for staggered optimistic removal progression
- Eliminated rollback fade-in ID leakage across subsequent clear attempts
