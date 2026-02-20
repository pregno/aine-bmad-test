# Story 3.4: Frontend - Complete Task with Animation and Optimistic UI

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to tap a task card to mark it complete with satisfying visual feedback,
so that I feel a sense of accomplishment when finishing tasks.

## Acceptance Criteria

**AC1 — Tap task card triggers completion animation**
- **Given** I see an active task in the task list
- **When** I tap anywhere on the task card
- **Then** a checkmark icon appears on the task card with a brief animation (~150ms)
- **And** the task text becomes crossed out (strikethrough) with smooth transition (~300ms)
- **And** the task card slides down to a "Completed" section at the bottom of the list (~300ms)
- **And** the total animation duration is approximately 300ms (not too fast or slow)

**AC2 — Optimistic UI: immediate update before server response**
- **Given** I tap a task to complete it
- **When** the optimistic UI update occurs
- **Then** the task moves to the completed section immediately (before server response)
- **And** a background `PATCH /api/v1/tasks/:id` request executes with `{ "status": "COMPLETED" }`
- **And** the task card remains in the completed section after server confirms

**AC3 — Server response updates task data**
- **Given** the backend successfully updates the task status
- **When** the PATCH response returns with `completedAt` timestamp
- **Then** the task data is updated with the server-provided timestamp
- **And** no visible UI change occurs (optimistic update already applied)

**AC4 — Backend failure reverts optimistic update**
- **Given** the backend request fails (network error or 500 status)
- **When** TanStack Query receives the error
- **Then** the task reverts back to the active section with undo animation
- **And** an error toast appears: "Failed to complete task. Try again?"
- **And** the strikethrough is removed

**AC5 — Tap completed task to un-complete**
- **Given** I tap a completed task in the completed section
- **When** the tap is registered
- **Then** the task un-completes (strikethrough removed, moves back to active section)
- **And** the same optimistic UI pattern applies (immediate update, background PATCH with `{ "status": "ACTIVE" }`)

## Tasks / Subtasks

- [x] **Task 1: Add `updateTaskStatus` to API client** (AC2, AC3, AC5)
  - [x] Add `updateTaskStatus(id: string, status: TaskStatus): Promise<UpdateTaskResponse>` to `packages/frontend/src/api/tasks.ts`
  - [x] `PATCH ${BASE_URL}/tasks/${id}` with body `{ status }` and `Content-Type: application/json`
  - [x] Return `{ task: Task }` on 200; throw on 4xx/5xx
  - [x] Use `UpdateTaskRequest` and `UpdateTaskResponse` from `@aine/shared`

- [x] **Task 2: Create `useUpdateTaskStatusMutation` hook** (AC2, AC3, AC4, AC5)
  - [x] Create `packages/frontend/src/hooks/useUpdateTaskStatusMutation.ts`
  - [x] Use `useMutation` from TanStack Query; follow `useCreateTaskMutation` pattern exactly
  - [x] `mutationFn: ({ id, status }) => updateTaskStatus(id, status)`
  - [x] `retry: 0` — **do NOT retry PATCH** (toggling must not auto-retry; rollback is immediate)
  - [x] `onMutate`: cancel queries, snapshot current cache, apply optimistic update (set `status` + `completedAt: new Date().toISOString()` if COMPLETED, else `completedAt: null`), return `{ previousTasks }` context
  - [x] `onError`: roll back cache to `context.previousTasks`; rollback must call `queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks)`
  - [x] `onSuccess`: replace the task in cache with the server-returned task (real `completedAt` from server)
  - [x] `onSettled`: `invalidateQueries({ queryKey: TASKS_QUERY_KEY, refetchType: 'none' })` (same pattern as create)

- [x] **Task 3: Split task list into active and completed sections in `HomePage`** (AC1, AC2, AC5)
  - [x] Derive `activeTasks` and `completedTasks` from `tasks` array using `task.status === TaskStatus.ACTIVE`
  - [x] Render active tasks in existing list (no header needed for active section)
  - [x] Render completed tasks in a separate `<Box component="ul">` below active tasks
  - [x] Add a section header for completed tasks: `<Typography variant="subtitle2">Completed ({completedTasks.length})</Typography>` — visible only when `completedTasks.length > 0`
  - [x] Apply strikethrough style to completed task text: `sx={{ textDecoration: 'line-through', color: 'text.secondary' }}`
  - [x] Add checkmark icon (`CheckCircleIcon` from `@mui/icons-material`) to completed task cards; position left of text using `Box` flex layout
  - [x] Completed tasks have reduced opacity (0.7) to indicate clickable un-complete; no extra icon needed

- [x] **Task 4: Wire tap handler on task cards** (AC1, AC2, AC4, AC5)
  - [x] Add `onClick` to each task card `<Card>` that calls `handleToggleTask(task)`
  - [x] `handleToggleTask`: call `updateTaskStatusMutation.mutate({ id: task.id, status: TaskStatus.ACTIVE/COMPLETED })`
  - [x] Add `sx={{ cursor: 'pointer' }}` to `<Card>` for visual affordance
  - [x] Pass `onError` callback to each `.mutate()` call to show the toast on failure (AC4)

- [x] **Task 5: Add error toast for completion failure** (AC4)
  - [x] Reuse the existing `<Snackbar>` + `<Alert>` pattern already in `HomePage`
  - [x] Add a second `Snackbar` state: `toggleErrorOpen` boolean
  - [x] Toast message: `"Failed to complete task. Try again?"`
  - [x] No retry button needed for this toast (AC4 says toast only; retry is a manual re-tap)
  - [x] Auto-dismiss after 6000ms (same as create error)

- [x] **Task 6: Add CSS transitions for animations** (AC1, AC4)
  - [x] `transition: 'opacity 300ms ease'` on Card `sx` for smooth opacity fade
  - [x] `transition: 'all 300ms ease'` on Typography `sx` for strikethrough transition
  - [x] No animation library added — CSS transitions via MUI `sx`

- [x] **Task 7: Write unit tests** (AC1–AC5)
  - [x] Added tests to `packages/frontend/src/components/HomePage.test.tsx`
  - [x] Follow the existing test file patterns: `renderWithTheme`, `vi.stubGlobal('fetch', ...)`, `cleanup` in `afterEach`
  - [x] Test AC1/AC2: Clicking active task calls PATCH with `COMPLETED` and task appears in completed section
  - [x] Test AC5: Clicking completed task calls PATCH with `ACTIVE` and task moves back to active section
  - [x] Test AC3: After PATCH success, task in cache has server-provided `completedAt`
  - [x] Test AC4: PATCH failure rolls back task to active and shows toast "Failed to complete task. Try again?"
  - [x] Test: Completed section header shows count and is only visible when completedTasks > 0
  - [x] Test: Strikethrough style applied to completed tasks

- [x] **Task 8: Verify all ACs**
  - [x] Run `pnpm --filter frontend test` → 39 tests pass
  - [x] Run `pnpm --filter frontend lint` → zero errors
  - [x] Run `pnpm --filter frontend type-check` → no type errors (also fixed pre-existing enum type error in `useCreateTaskMutation.ts`)

## Dev Notes

### CRITICAL: TanStack Query Optimistic Update Pattern

This story extends the existing TanStack Query setup introduced in Story 2.5. The `useUpdateTaskStatusMutation` hook MUST follow the same pattern as `useCreateTaskMutation`:

```typescript
// packages/frontend/src/hooks/useUpdateTaskStatusMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task, TaskStatus } from '@aine/shared';
import { updateTaskStatus } from '../api/tasks';
import { TASKS_QUERY_KEY } from '../lib/queryClient';

interface TasksCache {
  tasks: Task[];
}

interface UpdateTaskContext {
  previousTasks: TasksCache | undefined;
}

export function useUpdateTaskStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      updateTaskStatus(id, status),
    retry: 0, // CRITICAL: No retry for PATCH — rollback must be immediate
    onMutate: async ({ id, status }): Promise<UpdateTaskContext> => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasks = queryClient.getQueryData<TasksCache>(TASKS_QUERY_KEY);

      queryClient.setQueryData<TasksCache>(TASKS_QUERY_KEY, (current) => {
        const tasks = current?.tasks ?? [];
        return {
          tasks: tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  completedAt: status === 'COMPLETED' ? new Date().toISOString() : null,
                }
              : t
          ),
        };
      });

      return { previousTasks };
    },
    onError: (_error, _vars, context) => {
      if (context?.previousTasks !== undefined) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
    },
    onSuccess: ({ task }) => {
      queryClient.setQueryData<TasksCache>(TASKS_QUERY_KEY, (current) => {
        const tasks = current?.tasks ?? [];
        return {
          tasks: tasks.map((t) => (t.id === task.id ? task : t)),
        };
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY, refetchType: 'none' });
    },
  });
}
```

[Source: packages/frontend/src/hooks/useCreateTaskMutation.ts]

### CRITICAL: retry: 0 for PATCH

**Do NOT add retry logic to the status toggle mutation.** The create mutation retries 5 times because losing a task creation is high cost. Toggling a task status is a cheap, reversible action — the user can just tap again. Retrying a PATCH after a network failure can cause confusing UI states where the card flickers between active/completed. Keep `retry: 0`.

### CRITICAL: `UpdateTaskRequest` and `UpdateTaskResponse` Already Exist in `@aine/shared`

```typescript
// packages/shared/src/types/api.ts (already exists, do NOT modify)
export interface UpdateTaskRequest {
  status: TaskStatus;
}
export interface UpdateTaskResponse {
  task: Task;
}
```

Import these in `api/tasks.ts` and the mutation hook. The `TaskStatus` type is `'ACTIVE' | 'COMPLETED'`.
[Source: packages/shared/src/types/api.ts]

### CRITICAL: `PATCH /api/v1/tasks/:id` Endpoint Already Implemented

Backend Story 3.1 implemented this endpoint:
- `PATCH /api/v1/tasks/:id` with body `{ "status": "ACTIVE" | "COMPLETED" }`
- Returns 200 with `{ task: Task }` on success (task includes `completedAt` set by server)
- Returns 400 on invalid status, 404 if not found, 500 on DB error
[Source: 3-1-backend-api-update-task-status-endpoint.md]

### Animation Approach (No Animation Library)

The epic spec calls for ~300ms animations. Without Framer Motion or react-spring (not in deps), use CSS transitions via MUI `sx`:

```typescript
// On the task Card:
<Card
  onClick={() => handleToggleTask(task)}
  sx={{
    minHeight: 48,
    cursor: 'pointer',
    transition: 'opacity 300ms ease',
    opacity: task.status === 'COMPLETED' ? 0.7 : 1,
  }}
>
  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 }, display: 'flex', alignItems: 'center', gap: 1 }}>
    {task.status === 'COMPLETED' && (
      <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20, flexShrink: 0 }} />
    )}
    <Box>
      <Typography
        variant="body1"
        sx={{
          textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none',
          color: task.status === 'COMPLETED' ? 'text.secondary' : 'text.primary',
          transition: 'all 300ms ease',
        }}
      >
        {task.text}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {formatRelativeTime(task.createdAt)}
      </Typography>
    </Box>
  </CardContent>
</Card>
```

The "slide to completed section" is achieved by moving the task from the active list to the completed list in the React state — React's reconciliation re-renders in the new position. This is the MVP approach.

### Task List Split Pattern

```typescript
// In HomePage:
const activeTasks = tasks.filter((t) => t.status === 'ACTIVE');
const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');
```

Render two `<Box component="ul">` sections. Active on top (existing list), completed below with a `<Typography variant="subtitle2">Completed ({completedTasks.length})</Typography>` header.

### Error Toast Pattern (Reuse Existing)

The create error uses `createErrorOpen` state and a `<Snackbar>`. Add a parallel state for toggle errors:

```typescript
const [toggleErrorOpen, setToggleErrorOpen] = useState(false);
// In mutation onError callback:
setToggleErrorOpen(true);
```

Reuse the same `<Snackbar>` + `<Alert>` structure. No retry button in the toggle error toast (user re-taps to retry).

### Test Pattern for PATCH Calls

The existing test file mocks `globalThis.fetch`. For PATCH tests:

```typescript
const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
  if (init?.method === 'PATCH') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        task: { id: '1', text: 'Task', status: 'COMPLETED', createdAt: '...', completedAt: new Date().toISOString() },
      }),
    });
  }
  // GET
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ tasks: [/* initial tasks */] }),
  });
});
vi.stubGlobal('fetch', fetchMock);
```

[Source: packages/frontend/src/components/HomePage.test.tsx]

### Previous Story Learnings (Stories 2.3–2.6)

- **Always restore original fetch in `afterEach`** to prevent test pollution: `globalThis.fetch = originalFetch`
- **Use `cleanup()` in `afterEach`** to unmount components between tests
- **Use `waitFor`** for async state changes after fetch resolves
- **`renderWithTheme` wrapper** includes both `QueryClientProvider` (fresh client per test) and `ThemeProvider`
- **`TASKS_QUERY_KEY`** is imported from `lib/queryClient.ts` — use it for cache assertions in tests
- **TanStack Query `retry: false`** in test QueryClient default options prevents spurious retry calls
[Source: packages/frontend/src/components/HomePage.test.tsx]

### File Structure After This Story

```
packages/frontend/src/
├── api/
│   └── tasks.ts                          # MODIFIED — add updateTaskStatus()
├── hooks/
│   ├── useCreateTaskMutation.ts          # unchanged
│   ├── useTasksQuery.ts                  # unchanged
│   └── useUpdateTaskStatusMutation.ts    # NEW
├── components/
│   ├── HomePage.tsx                      # MODIFIED — split list, tap handler, toggle toast
│   ├── HomePage.test.tsx                 # MODIFIED — add AC1–AC5 tests
│   ├── AddTaskDialog.tsx                 # unchanged
│   └── ...
└── ...
```

### Architecture Compliance

- **TanStack Query mutations**: Use `useMutation` + optimistic update with `onMutate`/`onError`/`onSuccess`/`onSettled` (matches Story 2.5 patterns)
- **No new dependencies**: MUI icons already in `@mui/icons-material`; no animation library needed
- **`@aine/shared` types**: Use `TaskStatus`, `UpdateTaskRequest`, `UpdateTaskResponse`, `Task`
- **API endpoint**: `PATCH /api/v1/tasks/:id` (backend Stories 3.1)
[Source: technical-architecture-aine-bmad-test-2026-02-17.md]

### References

- PATCH endpoint: [Source: 3-1-backend-api-update-task-status-endpoint.md]
- TanStack Query mutation pattern: [Source: packages/frontend/src/hooks/useCreateTaskMutation.ts]
- Shared types: [Source: packages/shared/src/types/api.ts]
- Test patterns: [Source: packages/frontend/src/components/HomePage.test.tsx]
- MUI icons: https://mui.com/material-ui/material-icons/ (search "CheckCircle")
- MUI transitions via sx: https://mui.com/system/transitions/

## Dev Agent Record

### Agent Model Used

Cursor Composer

### Debug Log References

- Fixed TypeScript strict enum issue: string literals `'ACTIVE'`/`'COMPLETED'` are not assignable to `TaskStatus` enum in strict mode. Resolved by importing `TaskStatus` enum as a value in `HomePage.tsx`, `useUpdateTaskStatusMutation.ts`, and `useCreateTaskMutation.ts` (pre-existing issue), using `TaskStatus.ACTIVE` / `TaskStatus.COMPLETED` instead of string literals.
- Fixed test click targets: initial tests clicked the `<li data-taskid>` element, which is the PARENT of the `<Card>`. Events don't propagate DOWN to children, so Card's `onClick` was never triggered. Fixed by clicking the text element directly (click bubbles UP to Card).

### Completion Notes List

- Added `updateTaskStatus(id, status)` to `packages/frontend/src/api/tasks.ts` using `PATCH /api/v1/tasks/:id` with `UpdateTaskRequest`/`UpdateTaskResponse` from `@aine/shared`
- Created `useUpdateTaskStatusMutation.ts` hook with full TanStack Query optimistic update cycle (`onMutate`/`onError`/`onSuccess`/`onSettled`), `retry: 0`, and proper cache rollback on error
- Updated `HomePage.tsx` to split tasks into `activeTasks` / `completedTasks`, render two sections with a "Completed (N)" header, apply strikethrough + opacity to completed tasks, add `CheckCircleIcon`, wire `handleToggleTask` with per-mutate `onError` callback for toast
- Added `toggleErrorOpen` Snackbar state + `<Alert>` for "Failed to complete task. Try again?" toast
- Added 6 new tests to `HomePage.test.tsx` covering AC1–AC5, section header visibility, and strikethrough style
- Fixed pre-existing TypeScript strict-mode error in `useCreateTaskMutation.ts`: `status: 'ACTIVE'` → `status: TaskStatus.ACTIVE`
- Code-review fixes: added explicit checkmark animation (~150ms), added directional slide/undo animation cues for toggle transitions, and made toggle error toast message action-specific for complete vs un-complete failures
- Strengthened optimistic UI test to prove task moves to completed section before PATCH promise resolves
- Added regression test for un-complete failure messaging
- All 40 tests pass, lint clean, type-check clean

### File List

- `packages/frontend/src/api/tasks.ts` — MODIFIED (added `updateTaskStatus`, added `UpdateTaskRequest`/`UpdateTaskResponse`/`TaskStatus` imports)
- `packages/frontend/src/hooks/useUpdateTaskStatusMutation.ts` — NEW
- `packages/frontend/src/hooks/useCreateTaskMutation.ts` — MODIFIED (fixed `TaskStatus.ACTIVE` enum usage)
- `packages/frontend/src/components/HomePage.tsx` — MODIFIED (split lists, tap handler, action-specific toggle toast message, `CheckCircleIcon` animation, directional transition cues)
- `packages/frontend/src/components/HomePage.test.tsx` — MODIFIED (8 new tests for AC1–AC5, section header, strikethrough, optimistic-before-response behavior, un-complete error message)
- `_bmad-output/implementation-artifacts/3-4-frontend-complete-task-with-animation-and-optimistic-ui.md` — MODIFIED (story progress)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — MODIFIED (story status: in-progress → review)

### Change Log

| Date | Change |
|------|--------|
| 2026-02-18 | Story created |
| 2026-02-18 | Implemented all tasks: API function, mutation hook, HomePage split sections, tap handler, animations, toggle error toast, 6 new tests; fixed pre-existing `TaskStatus` enum type error |
| 2026-02-18 | Code-review fixes: completed animation behavior polish, stronger optimistic timing test, action-specific un-complete error message |

## Senior Developer Review (AI)

### Reviewer

Pregno

### Date

2026-02-18

### Outcome

Approved after fixes

### Findings Resolved

- Added explicit checkmark animation timing for completion feedback
- Added directional transition cues for completion/un-completion movement feedback
- Strengthened AC2 test to verify optimistic move happens before PATCH response resolves
- Fixed un-complete failure wording to show an action-specific toast message
