# Story 3.5: Frontend - Delete Task with Swipe Gesture

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to swipe left on a task card to delete it,
so that I can quickly remove unwanted tasks with a natural gesture.

## Acceptance Criteria

**AC1 — Swipe left reveals delete affordance**
- **Given** I see a task card in the list (active or completed)
- **When** I swipe left on the card
- **Then** the card slides partially left revealing a red delete button/icon
- **And** the rest of the list remains stationary (only swiped card moves)

**AC2 — Tap delete button opens confirmation dialog**
- **Given** the delete action is revealed via swipe (or visible via hover on desktop)
- **When** I tap the delete button
- **Then** a confirmation dialog appears: "Delete this task? This cannot be undone."
- **And** the dialog has "Cancel" and "Delete" buttons

**AC3 — Confirm delete removes task with animation**
- **Given** the delete confirmation dialog is open
- **When** I tap "Delete"
- **Then** the dialog closes immediately
- **And** the task card slides out left with fade animation (~300ms)
- **And** the task disappears from the list
- **And** a background `DELETE /api/v1/tasks/:id` request executes

**AC4 — Swipe cancel / tap elsewhere restores card**
- **Given** I swipe to reveal delete but tap elsewhere or swipe right
- **When** the gesture is cancelled
- **Then** the card slides back to its original position (undo swipe)
- **And** no deletion occurs

**AC5 — Backend success: task stays deleted**
- **Given** the backend successfully deletes the task
- **When** the DELETE response returns
- **Then** the task remains removed from the UI (already optimistically deleted)

**AC6 — Backend failure reverts optimistic delete**
- **Given** the backend request fails (network error or 5xx status)
- **When** TanStack Query receives the error
- **Then** the task reappears in the list with fade-in animation
- **And** an error toast appears: "Failed to delete task. Try again?"

**AC7 — Desktop hover shows delete button**
- **Given** I am on a desktop browser
- **When** I hover over a task card
- **Then** a delete icon button appears on the right side of the card
- **And** clicking the icon triggers the same confirmation dialog and deletion flow

## Tasks / Subtasks

- [x] **Task 1: Add `deleteTask` to API client** (AC3, AC5, AC6)
  - [x] Add `deleteTask(id: string): Promise<void>` to `packages/frontend/src/api/tasks.ts`
  - [x] `DELETE ${BASE_URL}/tasks/${id}` — no request body, no `Content-Type` header needed
  - [x] Backend returns 204 No Content — do NOT call `response.json()`, just check `response.ok`
  - [x] Throw on non-2xx status (consistent with other API functions)

- [x] **Task 2: Create `useDeleteTaskMutation` hook** (AC3, AC5, AC6)
  - [x] Create `packages/frontend/src/hooks/useDeleteTaskMutation.ts`
  - [x] `mutationFn: (id: string) => deleteTask(id)`
  - [x] `retry: 0` — rollback must be immediate (same reasoning as update mutation)
  - [x] `onMutate`: cancel queries, snapshot `previousTasks`, filter out task by id, return `{ previousTasks }`
  - [x] `onError`: restore `context.previousTasks` to cache via `queryClient.setQueryData`
  - [x] `onSuccess`: task already removed from cache; nothing to do
  - [x] `onSettled`: `invalidateQueries({ queryKey: TASKS_QUERY_KEY, refetchType: 'none' })` (same as other mutations)

- [x] **Task 3: Create `SwipeableTaskCard` component** (AC1, AC2, AC3, AC4, AC7)
  - [x] Create `packages/frontend/src/components/SwipeableTaskCard.tsx`
  - [x] Props: `task: Task`, `onToggle: (task: Task) => void`, `onDelete: (id: string) => void`
  - [x] State: `swipeX`, `isRevealed`, `deleteDialogOpen`, `isExiting`, `isHovered`, `isDragging`
  - [x] Swipe gesture: `onTouchStart`, `onTouchMove`, `onTouchEnd` with `isDragging` state to disable transition while dragging
  - [x] Desktop hover: `onMouseEnter`/`onMouseLeave` on the card wrapper
  - [x] Delete button: always rendered, visible on hover/reveal, `data-testid` + `aria-label="delete task"`
  - [x] Exit animation: `isExiting: true` → CSS `translateX(-110%)` + `opacity: 0` → 300ms → `onDelete(task.id)`
  - [x] Inline MUI `<Dialog>` for confirmation with `data-testid="delete-cancel"` and `data-testid="delete-confirm"`
  - [x] Active and completed task visual styles correctly reproduced (strikethrough, opacity, CheckCircleIcon)

- [x] **Task 4: Update `HomePage` to use `SwipeableTaskCard`** (AC1–AC7)
  - [x] Import `SwipeableTaskCard` and `useDeleteTaskMutation`
  - [x] Added `handleDeleteTask` callback with `onError: () => setDeleteErrorOpen(true)`
  - [x] Replaced both active-task and completed-task card JSX blocks with `<SwipeableTaskCard>` calls
  - [x] Added `deleteErrorOpen` state + `handleCloseDeleteError` handler
  - [x] Added third `<Snackbar>` for delete error with message "Failed to delete task. Try again?"
  - [x] Removed `animatedTaskId`, `animationDirection`, `animationTimeoutRef`, `useEffect`, `useRef` (no longer needed)
  - [x] Fixed `activeTasks`/`completedTasks` filters to use `TaskStatus.ACTIVE`/`TaskStatus.COMPLETED` enum values

- [x] **Task 5: Write unit tests** (AC2–AC7)
  - [x] Added 5 tests to `packages/frontend/src/components/HomePage.test.tsx`
  - [x] Test AC2: clicking delete button opens confirmation dialog
  - [x] Test AC4: Cancel closes dialog without deleting
  - [x] Test AC3 optimistic: task removed before DELETE resolves (using `deferred<Response>()`)
  - [x] Test AC6: DELETE failure shows toast + task reappears
  - [x] Test AC7: delete button accessible for both active and completed tasks
  - [x] Fixed 2 pre-existing tests (ul/li DOM structure → `compareDocumentPosition` for order checks)

- [x] **Task 6: Verify all ACs**
  - [x] Run `pnpm --filter frontend test` → 45 tests pass (40 prior + 5 new)
  - [x] Run `pnpm --filter frontend lint` → zero errors
  - [x] Run `pnpm --filter frontend type-check` → no type errors (fixed `sx={undefined}` → `sx={}` for exactOptionalPropertyTypes)

## Dev Notes

### CRITICAL: `DELETE /api/v1/tasks/:id` Endpoint Already Implemented

Backend Story 3.2 implemented this endpoint:
- `DELETE /api/v1/tasks/:id`
- Returns **204 No Content** on success — **no response body** — do NOT call `response.json()`
- Returns 404 if task not found, 500 on DB error
- Route ordering note: in backend routes, `DELETE /tasks/completed` is registered BEFORE `DELETE /tasks/:id` so route matching won't conflict

```typescript
// packages/frontend/src/api/tasks.ts — ADD this function
export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete task: ${response.status}`);
  }
  // 204 No Content — no body to parse
}
```
[Source: 3-2-backend-api-delete-single-task-endpoint.md]

### CRITICAL: `useDeleteTaskMutation` Hook Pattern

Follow `useUpdateTaskStatusMutation` exactly, but instead of updating a task, filter it out:

```typescript
// packages/frontend/src/hooks/useDeleteTaskMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task } from '@aine/shared';
import { deleteTask } from '../api/tasks';
import { TASKS_QUERY_KEY } from '../lib/queryClient';

interface TasksCache {
  tasks: Task[];
}

interface DeleteTaskContext {
  previousTasks: TasksCache | undefined;
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    retry: 0, // CRITICAL: No retry for DELETE — rollback must be immediate
    onMutate: async (id): Promise<DeleteTaskContext> => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasks = queryClient.getQueryData<TasksCache>(TASKS_QUERY_KEY);

      queryClient.setQueryData<TasksCache>(TASKS_QUERY_KEY, (current) => ({
        tasks: (current?.tasks ?? []).filter((t) => t.id !== id),
      }));

      return { previousTasks };
    },
    onError: (_error, _vars, context) => {
      if (context?.previousTasks !== undefined) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
    },
    // onSuccess: nothing — task already removed from cache
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY, refetchType: 'none' });
    },
  });
}
```
[Source: packages/frontend/src/hooks/useUpdateTaskStatusMutation.ts]

### CRITICAL: SwipeableTaskCard Component Architecture

Extract the card JSX from `HomePage.tsx` into a new `SwipeableTaskCard.tsx` component. The current active/completed card JSX in `HomePage.tsx` contains animation state (`animatedTaskId`, `animationDirection`) that should move into this component.

```typescript
// packages/frontend/src/components/SwipeableTaskCard.tsx
import { useState, useRef } from 'react';
import { Alert, Box, Button, Card, CardContent, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { Task } from '@aine/shared';
import { TaskStatus } from '@aine/shared';
import { formatRelativeTime } from '../utils/formatRelativeTime';

const SWIPE_THRESHOLD = 72; // px to trigger delete reveal
const SWIPE_MAX = 80;       // max swipe distance in px (width of delete zone)

interface SwipeableTaskCardProps {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function SwipeableTaskCard({ task, onToggle, onDelete }: SwipeableTaskCardProps) {
  const [swipeX, setSwipeX] = useState(0);       // 0 to -SWIPE_MAX
  const [isRevealed, setIsRevealed] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const startXRef = useRef(0);
  const isSwipingRef = useRef(false);

  const isCompleted = task.status === TaskStatus.COMPLETED;
  const showDeleteButton = isRevealed || isHovered;

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0]!.clientX;
    isSwipingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = e.touches[0]!.clientX - startXRef.current;
    if (deltaX < 0) {
      // Left swipe — reveal delete zone
      isSwipingRef.current = true;
      setSwipeX(Math.max(deltaX, -SWIPE_MAX));
    } else if (isRevealed && deltaX > 0) {
      // Right swipe while revealed — close delete zone
      isSwipingRef.current = true;
      setSwipeX(Math.min(-SWIPE_MAX + deltaX, 0));
    }
  };

  const handleTouchEnd = () => {
    if (-swipeX >= SWIPE_THRESHOLD) {
      setSwipeX(-SWIPE_MAX);
      setIsRevealed(true);
    } else {
      setSwipeX(0);
      setIsRevealed(false);
    }
    isSwipingRef.current = false;
  };

  const handleCardClick = () => {
    if (isSwipingRef.current || isRevealed) return; // don't toggle if swiped
    onToggle(task);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card click (toggle)
    setDeleteDialogOpen(true);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSwipeX(0);
    setIsRevealed(false);
  };

  const handleConfirmDelete = () => {
    setDeleteDialogOpen(false);
    setIsExiting(true);
    // Give animation time to complete before calling onDelete
    window.setTimeout(() => {
      onDelete(task.id);
    }, 300);
  };

  return (
    <Box
      sx={{ position: 'relative', mb: 1, overflow: 'hidden' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Red delete zone behind card */}
      <Box
        sx={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: SWIPE_MAX,
          bgcolor: 'error.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 1,
        }}
      >
        <DeleteIcon sx={{ color: 'white' }} />
      </Box>

      {/* Task card (sits on top of delete zone) */}
      <Card
        component="div"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCardClick}
        sx={{
          minHeight: 48,
          cursor: 'pointer',
          position: 'relative',
          transform: isExiting
            ? 'translateX(-110%)'
            : `translateX(${swipeX}px)`,
          opacity: isExiting ? 0 : isCompleted ? 0.7 : 1,
          transition: isSwipingRef.current
            ? 'none' // no transition while dragging — responsive to finger
            : 'transform 250ms ease, opacity 250ms ease',
        }}
      >
        <CardContent
          sx={{
            py: 1.5,
            '&:last-child': { pb: 1.5 },
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {isCompleted && (
            <CheckCircleIcon
              sx={{ color: 'success.main', fontSize: 20, flexShrink: 0 }}
            />
          )}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body1"
              sx={isCompleted ? {
                textDecoration: 'line-through',
                color: 'text.secondary',
              } : undefined}
            >
              {task.text}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatRelativeTime(task.createdAt)}
            </Typography>
          </Box>

          {/* Delete button — always rendered, visible on hover or swipe */}
          <IconButton
            aria-label="delete task"
            data-testid={`delete-task-${task.id}`}
            onClick={handleDeleteClick}
            size="small"
            sx={{
              color: 'error.main',
              opacity: showDeleteButton ? 1 : 0,
              transition: 'opacity 150ms ease',
              // Still accessible even when invisible (pointer-events none when hidden)
              pointerEvents: showDeleteButton ? 'auto' : 'none',
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Delete task?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete this task? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} data-testid="delete-cancel">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            data-testid="delete-confirm"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
```

### CRITICAL: Updating HomePage to Use SwipeableTaskCard

Replace the active and completed task list JSX in `HomePage.tsx` to use `<SwipeableTaskCard>`. The `animatedTaskId` and `animationDirection` states **can be removed** from `HomePage.tsx` since the card component manages its own visual state. The toggle handler stays in `HomePage.tsx`.

Key changes in `HomePage.tsx`:
1. Remove `animatedTaskId`, `animationDirection`, `animationTimeoutRef` state (moved to or no longer needed)
2. Import `SwipeableTaskCard`
3. Add `useDeleteTaskMutation` hook
4. Add `deleteErrorOpen` state + close handler
5. Replace card JSX with `<SwipeableTaskCard>` in both active and completed loops
6. Add delete error `<Snackbar>`

```typescript
// Minimal additions to HomePage.tsx

import { SwipeableTaskCard } from './SwipeableTaskCard';
import { useDeleteTaskMutation } from '../hooks/useDeleteTaskMutation';

// Inside component:
const deleteTaskMutation = useDeleteTaskMutation();
const [deleteErrorOpen, setDeleteErrorOpen] = useState(false);
const handleCloseDeleteError = useCallback(() => setDeleteErrorOpen(false), []);

const handleDeleteTask = useCallback(
  (id: string) => {
    deleteTaskMutation.mutate(id, {
      onError: () => {
        setDeleteErrorOpen(true);
      },
    });
  },
  [deleteTaskMutation]
);

// Replace active-task list mapping:
{activeTasks.map((task) => (
  <SwipeableTaskCard
    key={task.id}
    task={task}
    onToggle={handleToggleTask}
    onDelete={handleDeleteTask}
  />
))}

// Replace completed-task list mapping:
{completedTasks.map((task) => (
  <SwipeableTaskCard
    key={task.id}
    task={task}
    onToggle={handleToggleTask}
    onDelete={handleDeleteTask}
  />
))}

// Add delete error Snackbar (below existing ones):
<Snackbar
  open={deleteErrorOpen}
  autoHideDuration={6000}
  onClose={handleCloseDeleteError}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
>
  <Alert onClose={handleCloseDeleteError} severity="error" sx={{ width: '100%' }}>
    Failed to delete task. Try again?
  </Alert>
</Snackbar>
```

When migrating from the inline card JSX to `SwipeableTaskCard`, the `<Box component="li">` wrapper in the `<ul>` lists should be removed — the `SwipeableTaskCard` itself renders an outer `<Box>` with margin. Update the `<ul>` lists to map directly to `<SwipeableTaskCard>`.

**IMPORTANT**: The `animatedTaskId` and `animationDirection` states used in Story 3.4 for toggle animations were in `HomePage.tsx`. Since those animations were applied via inline sx props on the card JSX that's now moved to `SwipeableTaskCard`, those state variables and the `useEffect` cleanup can be removed from `HomePage.tsx`. Story 3.5 does not need to reproduce the Story 3.4 directional slide animation — keep the `SwipeableTaskCard` simple for now. The `useRef` animation timeout and cleanup `useEffect` can be removed.

### CRITICAL: Delete Animation Timing

The `isExiting` pattern delays calling `onDelete` by 300ms to let the CSS slide-out animation finish:

```typescript
const handleConfirmDelete = () => {
  setDeleteDialogOpen(false);
  setIsExiting(true);
  window.setTimeout(() => {
    onDelete(task.id); // triggers onMutate → removes from cache → unmounts component
  }, 300);
};
```

This is safe because:
1. Card slides out (300ms CSS animation driven by `isExiting: true`)
2. After 300ms, `onDelete(task.id)` is called
3. `onMutate` runs: snapshot cache, filter out task, update cache
4. React removes the `<SwipeableTaskCard>` component from DOM (animation already done)
5. If DELETE fails: `onError` restores cache, component remounts via React reconciliation

Do NOT add `retry: 3` to the delete mutation — if DELETE fails, the task reappears and user can try again. This matches the same reasoning as the update mutation.

### CRITICAL: Swipe Gesture and `isSwipingRef` for Transition

The `isSwipingRef.current` is used in the Card's `sx.transition` to disable CSS transition while the user's finger is dragging (feels laggy otherwise). However, `isSwipingRef` is a `ref`, not state — it won't trigger re-renders. Since `sx` is computed during render, and the component only re-renders when `swipeX` changes (which happens on `handleTouchMove`), the `isSwipingRef.current` value will be correct at render time.

An alternative simpler approach if the ref causes confusion: always keep transition active but use a very fast transition (50ms) during active swipe and 250ms for snap-back. Set a boolean state `isDragging` instead of a ref:
```typescript
const [isDragging, setIsDragging] = useState(false);
// in handleTouchStart: setIsDragging(true)
// in handleTouchEnd: setIsDragging(false)
// sx transition: isDragging ? 'none' : 'transform 250ms ease, opacity 250ms ease'
```
This is cleaner and triggers re-renders correctly.

### Test Pattern for Delete Flow

Use `data-testid={`delete-task-${task.id}`}` to access the delete button without simulating swipe gestures (swipe testing requires complex touch event simulation not practical in jsdom):

```typescript
it('clicking delete button opens confirmation dialog (AC2)', async () => {
  const task = { id: 'del-1', text: 'Task to delete', status: 'ACTIVE' as const,
    createdAt: new Date().toISOString(), completedAt: null };

  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ tasks: [task] }),
  }));

  renderWithTheme(<HomePage />);

  await waitFor(() => expect(screen.getByText('Task to delete')).toBeInTheDocument());

  // Delete button is accessible via data-testid
  await userEvent.click(screen.getByTestId('delete-task-del-1'));

  expect(screen.getByText('Delete this task? This cannot be undone.')).toBeInTheDocument();
  expect(screen.getByTestId('delete-cancel')).toBeInTheDocument();
  expect(screen.getByTestId('delete-confirm')).toBeInTheDocument();
});

it('confirming delete removes task optimistically and calls DELETE API (AC3)', async () => {
  const task = { id: 'del-2', text: 'Task to remove', status: 'ACTIVE' as const,
    createdAt: new Date().toISOString(), completedAt: null };

  const deleteDeferred = deferred<Response>();
  const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
    if (init?.method === 'DELETE') return deleteDeferred.promise;
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ tasks: [task] }),
    } as Response);
  });
  vi.stubGlobal('fetch', fetchMock);
  renderWithTheme(<HomePage />);

  await waitFor(() => expect(screen.getByText('Task to remove')).toBeInTheDocument());

  await userEvent.click(screen.getByTestId('delete-task-del-2'));
  await userEvent.click(screen.getByTestId('delete-confirm'));

  // Optimistic removal: task gone from list before DELETE resolves
  await waitFor(() => expect(screen.queryByText('Task to remove')).not.toBeInTheDocument());

  const deleteCall = fetchMock.mock.calls.find(
    ([url]: [string]) => url.includes('del-2') && !url.includes('completed')
  );
  expect(deleteCall).toBeDefined();

  deleteDeferred.resolve({ ok: true } as Response);
});

it('cancel delete closes dialog without removing task (AC4)', async () => {
  const task = { id: 'del-3', text: 'Keep this task', status: 'ACTIVE' as const,
    createdAt: new Date().toISOString(), completedAt: null };

  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ tasks: [task] }),
  }));
  renderWithTheme(<HomePage />);

  await waitFor(() => expect(screen.getByText('Keep this task')).toBeInTheDocument());

  await userEvent.click(screen.getByTestId('delete-task-del-3'));
  await userEvent.click(screen.getByTestId('delete-cancel'));

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByText('Keep this task')).toBeInTheDocument();
});

it('DELETE failure shows error toast and task reappears (AC6)', async () => {
  const task = { id: 'del-4', text: 'Fails to delete', status: 'ACTIVE' as const,
    createdAt: new Date().toISOString(), completedAt: null };

  const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
    if (init?.method === 'DELETE') return Promise.resolve({ ok: false, status: 500 });
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ tasks: [task] }),
    });
  });
  vi.stubGlobal('fetch', fetchMock);
  renderWithTheme(<HomePage />);

  await waitFor(() => expect(screen.getByText('Fails to delete')).toBeInTheDocument());

  await userEvent.click(screen.getByTestId('delete-task-del-4'));
  await userEvent.click(screen.getByTestId('delete-confirm'));

  // Error toast
  await waitFor(() =>
    expect(screen.getByText('Failed to delete task. Try again?')).toBeInTheDocument()
  );

  // Task reappears (rollback)
  await waitFor(() =>
    expect(screen.getByText('Fails to delete')).toBeInTheDocument()
  );
});
```

### Known Limitation: Swipe Gesture Not Unit-Testable in jsdom

Simulating touch gestures in jsdom with Vitest/Testing Library is not reliable — `TouchEvent` support is incomplete. **Do not attempt to write unit tests for the swipe gesture itself.** Instead:
- Unit tests use the `data-testid` delete button (which is also the desktop hover button)
- Manual QA or Playwright E2E should verify the swipe interaction on mobile viewport

This is standard practice for gesture-based interactions in web apps.

### Previous Story Learnings (Story 3.4)

From Story 3.4 debug notes:
- **Click on text to trigger Card onClick** (not on the card/li wrapper — events don't propagate downward). When testing, click the task text element, not a parent container.
- **`deferred<Response>()`** is already defined in `HomePage.test.tsx` — reuse it for DELETE tests.
- **`TaskStatus.ACTIVE`/`TaskStatus.COMPLETED` enum values** — import `TaskStatus` as a value (not just type) and use enum members instead of string literals. This is TypeScript strict mode required.
- **`afterEach`**: `cleanup()` + `globalThis.fetch = originalFetch` are already in the test file.
- **`retry: false`** in test QueryClient prevents spurious retry interference.
[Source: packages/frontend/src/components/HomePage.test.tsx, Story 3.4 debug log]

### IMPORTANT: `activeTasks` String Literal in HomePage

Current `HomePage.tsx` line 41 uses a string literal comparison:
```typescript
const activeTasks = tasks.filter((t) => t.status === 'ACTIVE');
```
This works but ideally should use `TaskStatus.ACTIVE` enum value. Since `TaskStatus` is already imported in `HomePage.tsx` from Story 3.4, update this to use the enum:
```typescript
const activeTasks = tasks.filter((t) => t.status === TaskStatus.ACTIVE);
const completedTasks = tasks.filter((t) => t.status === TaskStatus.COMPLETED);
```

### File Structure After This Story

```
packages/frontend/src/
├── api/
│   └── tasks.ts                          # MODIFIED — add deleteTask()
├── hooks/
│   ├── useCreateTaskMutation.ts          # unchanged
│   ├── useTasksQuery.ts                  # unchanged
│   ├── useUpdateTaskStatusMutation.ts    # unchanged
│   └── useDeleteTaskMutation.ts          # NEW
├── components/
│   ├── HomePage.tsx                      # MODIFIED — use SwipeableTaskCard, add delete state
│   ├── HomePage.test.tsx                 # MODIFIED — add delete tests (4-5 new tests)
│   ├── SwipeableTaskCard.tsx             # NEW
│   ├── AddTaskDialog.tsx                 # unchanged
│   └── ...
└── ...
```

### Architecture Compliance

- **TanStack Query mutations**: `retry: 0` for DELETE (same as PATCH — immediate rollback required)
- **Optimistic UI**: remove from cache in `onMutate`, restore in `onError`
- **No new dependencies**: MUI Dialog/IconButton already available; `@mui/icons-material` already installed (used for `CheckCircleIcon` in Story 3.4 — `DeleteIcon` available from same package)
- **CSS-only animations**: `translateX` + `opacity` transitions via MUI `sx` prop (no Framer Motion)
- **`@aine/shared` types**: Only `Task` and `TaskStatus` needed for this story; no new shared types required (DELETE 204 has no response body)
[Source: technical-architecture-aine-bmad-test-2026-02-17.md]

### References

- DELETE endpoint: [Source: 3-2-backend-api-delete-single-task-endpoint.md]
- Optimistic delete pattern: [Source: packages/frontend/src/hooks/useUpdateTaskStatusMutation.ts]
- Test patterns: [Source: packages/frontend/src/components/HomePage.test.tsx]
- MUI Dialog: https://mui.com/material-ui/react-dialog/
- MUI icons (Delete): https://mui.com/material-ui/material-icons/?query=delete (use `DeleteIcon`)
- Touch event handling in React: https://react.dev/reference/react-dom/components/common#touch-events

## Dev Agent Record

### Agent Model Used

Cursor Composer

### Debug Log References

- Fixed TypeScript strict mode error: `sx={undefined}` is not assignable with `exactOptionalPropertyTypes: true`. Changed to `sx={}` in `SwipeableTaskCard.tsx`.
- Fixed 2 pre-existing tests that queried `ul/li` DOM structure (which no longer exists after replacing the task list with `SwipeableTaskCard` components). Updated to use `compareDocumentPosition` for order verification instead.

### Completion Notes List

- Added `deleteTask(id)` to `packages/frontend/src/api/tasks.ts` — `DELETE /api/v1/tasks/:id`, 204 No Content, no `response.json()` call
- Created `useDeleteTaskMutation.ts` with `retry: 0`, optimistic cache removal in `onMutate`, rollback on `onError`, `invalidateQueries` on `onSettled`
- Created `SwipeableTaskCard.tsx` extracting all card JSX from `HomePage.tsx` — handles swipe touch gestures (`onTouchStart`/`onTouchMove`/`onTouchEnd`), desktop hover (delete button visible on `isHovered`), exit animation (`isExiting: true` → `translateX(-110%)` + `opacity: 0` → 300ms delay → `onDelete(id)`), inline MUI `<Dialog>` for delete confirmation
- Updated `HomePage.tsx`: replaced active/completed card JSX with `<SwipeableTaskCard>`, added `useDeleteTaskMutation`, `handleDeleteTask`, `deleteErrorOpen` state + close handler, third `<Snackbar>` for delete error; removed `animatedTaskId`/`animationDirection`/`animationTimeoutRef`/`useEffect`/`useRef` (no longer needed); fixed `TaskStatus.ACTIVE`/`TaskStatus.COMPLETED` enum usage in filter
- Added 7 new tests covering AC1–AC7; fixed 2 pre-existing order-verification tests to use `compareDocumentPosition` instead of `ul > li` DOM queries
- All 47 tests pass, lint clean, type-check clean
- Code-review fixes: implemented rollback fade-in animation for failed delete restores, added outside-tap swipe reveal close behavior, added cleanup for delete/swipe timeout lifecycle safety, and strengthened AC coverage for swipe reveal + successful delete persistence

### File List

- `packages/frontend/src/api/tasks.ts` — MODIFIED (added `deleteTask`)
- `packages/frontend/src/hooks/useDeleteTaskMutation.ts` — NEW
- `packages/frontend/src/components/SwipeableTaskCard.tsx` — NEW
- `packages/frontend/src/components/HomePage.tsx` — MODIFIED (use SwipeableTaskCard, add delete state, remove animation state)
- `packages/frontend/src/components/HomePage.test.tsx` — MODIFIED (7 new delete/swap tests + 2 pre-existing order tests fixed)
- `_bmad-output/implementation-artifacts/3-5-frontend-delete-task-with-swipe-gesture.md` — MODIFIED (story progress)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — MODIFIED (story status: ready-for-dev → in-progress → review → done)

### Change Log

| Date | Change |
|------|--------|
| 2026-02-18 | Story created |
| 2026-02-18 | Implemented all tasks: deleteTask API, useDeleteTaskMutation hook, SwipeableTaskCard component, HomePage refactor, 5 new tests; fixed 2 pre-existing tests and a TypeScript strictness error |
| 2026-02-18 | Code-review fixes: rollback fade-in behavior, outside-tap swipe-close behavior, timeout cleanup safety, and additional AC validation tests |

## Senior Developer Review (AI)

### Reviewer

Pregno

### Date

2026-02-18

### Outcome

Approved after fixes

### Findings Resolved

- Added rollback fade-in behavior for failed delete restores to satisfy AC6
- Added outside-tap gesture cancellation for revealed swipe state to fully satisfy AC4
- Added timeout cleanup to prevent stale async callbacks after unmount
- Added explicit AC5 assertion that task remains deleted after successful DELETE resolution
- Added explicit AC1 swipe-reveal test coverage
