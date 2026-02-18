# Story 2.3: Frontend - Task List View with Empty State

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to see my task list displayed in a clean, mobile-friendly layout,
so that I can scan my tasks at a glance.

## Acceptance Criteria

**AC1 — Themed home page with layout**
- **Given** the frontend app loads successfully
- **When** I navigate to the home page (`/`)
- **Then** I see a Material-UI themed page with primary color #2196F3
- **And** the page displays a centered content area with max-width 600px on desktop
- **And** Roboto font is applied to all text

**AC2 — Empty state with FAB**
- **Given** there are no tasks in the database
- **When** the task list view loads
- **Then** I see an empty state message: "No tasks yet. Tap + to get started."
- **And** I see a floating action button (FAB) in the bottom-right corner
- **And** the FAB has a "+" icon and uses the primary color (#2196F3)

**AC3 — Task list with cards**
- **Given** the task list API returns 3 active tasks
- **When** the task list view loads
- **Then** I see 3 task cards displayed in a vertical list
- **And** each task card shows the task text
- **And** each task card shows a relative timestamp (e.g., "2 min ago", "10:30 AM")
- **And** the cards are ordered newest-first (matching API sort order)
- **And** each task card has a minimum height of 48px for touch targets

**AC4 — API failure handling**
- **Given** the task list API request fails
- **When** the task list view attempts to load
- **Then** I see an error message: "Failed to load tasks"
- **And** I see a "Retry" button to manually trigger reload
- **And** the FAB remains visible and functional

## Tasks / Subtasks

- [x] Task 1: Add API client and fetch tasks on mount (AC3, AC4)
  - [x] Create API client module or use fetch with `import.meta.env.VITE_API_URL`
  - [x] Base URL: `VITE_API_URL` (e.g. `http://localhost:3000/api/v1`) — append `/tasks` for GET
  - [x] Define `fetchTasks()` → `GET /tasks` returns `GetTasksResponse` from `@aine/shared`
  - [x] In HomePage (or new TaskListPage), use `useEffect` + `useState` to fetch on mount; handle loading, error, success
  - [x] Do NOT use TanStack Query yet — that is Story 2.5; use plain fetch/useState

- [x] Task 2: Implement empty state and FAB (AC1, AC2)
  - [x] Update HomePage to be the task list view (or create `TaskListPage` and route `/` to it)
  - [x] Ensure Container maxWidth 600px (`maxWidth="sm"` = 600px) or use `sx={{ maxWidth: 600, mx: 'auto' }}`
  - [x] When `tasks.length === 0` and not loading: show Typography "No tasks yet. Tap + to get started."
  - [x] Add MUI `Fab` in bottom-right: `position: fixed`, `bottom: 16`, `right: 16`, `color="primary"`, icon `AddIcon` (+)
  - [x] FAB does not need tap handler for this story — Story 2.4 adds dialog; FAB can be `onClick={() => {}}` or no handler

- [x] Task 3: Implement task cards list (AC3)
  - [x] When tasks exist: render list of Card/ListItem/Paper components (vertical stack)
  - [x] Each card: task text (Typography), relative timestamp from `createdAt` (e.g. "2 min ago" via date-fns or custom helper)
  - [x] Use `Task` type from `@aine/shared`; display `task.text`, `task.createdAt` (format as relative)
  - [x] Order: pass tasks as-is from API (already newest-first per Story 2.2)
  - [x] Min height 48px per card (`sx={{ minHeight: 48 }}` or `minHeight: '48px'`)

- [x] Task 4: Implement error state with Retry (AC4)
  - [x] When fetch fails: show "Failed to load tasks" and "Retry" Button
  - [x] Retry: call fetch again (reset error, set loading, refetch)
  - [x] FAB remains visible in both error and empty states

- [x] Task 5: Add tests (AC1–AC4)
  - [x] Unit/integration tests for TaskList or HomePage: mock fetch, assert empty state, task list, error state, Retry
  - [x] Use Vitest; optionally MSW for fetch mocking
  - [x] Ensure theme (primary #2196F3) is applied — may require wrapping in ThemeProvider in tests

- [x] Task 6: Verify all ACs (AC1–AC4)
  - [x] Run `pnpm --filter frontend test`
  - [x] Manually: `pnpm dev` with backend running; verify empty state, add tasks via API/curl, verify list
  - [x] Simulate API failure (e.g. backend stopped) → verify error + Retry
  - [x] Run `pnpm lint` → zero new errors

## Dev Notes

### CRITICAL: API Base URL

Use `import.meta.env.VITE_API_URL` — configured in `.env.development` as `http://localhost:3000/api/v1`. Full tasks endpoint: `${VITE_API_URL}/tasks` or `VITE_API_URL + '/tasks'`.
[Source: .env.development, architecture-decisions-aine-bmad-test-2026-02-17.md]

### CRITICAL: Theme and Layout Already Exist

- MUI theme with primary #2196F3 and Roboto: `packages/frontend/src/theme/muiTheme.ts`
- HomePage uses `Container maxWidth="sm"` (600px); ensure task list view preserves this
- Do NOT re-create theme — reuse from 1.4

### Relative Timestamp

Use `date-fns/formatDistanceToNow` or similar for "2 min ago", "10:30 AM". If `date-fns` not installed, add it or implement a simple relative formatter (e.g. difference in ms → "X min ago").
[Source: technical-architecture-aine-bmad-test-2026-02-17.md#frontend-architecture]

### FAB Scope

Story 2.3: FAB is **visible** and styled. Story 2.4: FAB **opens dialog**. For 2.3, FAB can have `onClick` that does nothing or is omitted.
[Source: epics.md Story 2.3 vs 2.4]

### Do NOT Implement in This Story

- TanStack Query — Story 2.5
- Add-task dialog / FAB tap behavior — Story 2.4
- Task creation (POST) — Story 2.4
- Optimistic updates — Story 2.5

### Previous Story Learnings (Story 1.4, 2.2)

- **HomePage**: Current placeholder at `packages/frontend/src/components/HomePage.tsx`; has `initialData?: GetTasksResponse` prop — replace with real fetch.
- **Structure**: `main.tsx` → ThemeProvider, BrowserRouter, App → Routes → HomePage at `/`
- **MUI**: Use `Fab`, `AddIcon`, `Container`, `Typography`, `Box`, `Card` or `ListItem`
- **GET /api/v1/tasks**: Returns `{ tasks: Task[] }`; tasks have `id`, `text`, `status`, `createdAt`, `completedAt`
[Source: 1-4-frontend-foundation-with-react-vite-and-material-ui.md, 2-2-backend-api-get-all-tasks-endpoint-with-sorting.md]

### Exact Strings (Copy Exactly)

- Empty state: `"No tasks yet. Tap + to get started."`
- Error message: `"Failed to load tasks"`
- Retry button: `"Retry"`

### File Structure After This Story

```
packages/frontend/src/
├── components/
│   ├── HomePage.tsx        # MODIFIED — task list view, empty state, FAB
│   ├── TaskList.tsx        # NEW (optional) — task cards list
│   └── ...
├── api/
│   └── tasks.ts            # NEW (optional) — fetchTasks()
├── theme/
│   └── muiTheme.ts         # unchanged
└── ...
```

### References

- GET /api/v1/tasks: [Source: 2-2-backend-api-get-all-tasks-endpoint-with-sorting.md]
- MUI Fab: https://mui.com/material-ui/react-floating-action-button/
- VITE_API_URL: [Source: .env.development, 1-2-docker-compose-multi-environment-configuration.md]

## Dev Agent Record

### Agent Model Used

Claude (Cursor)

### Debug Log References

- Used custom formatRelativeTime util instead of date-fns to avoid new dependency.
- Added @mui/icons-material, @testing-library/react, @testing-library/user-event, jsdom, @testing-library/jest-dom for tests.
- Tests use vi.stubGlobal('fetch') to mock; FAB rendered multiple times in DOM, used getAllByRole/getAllByTestId where needed.

### Completion Notes List

- Created `packages/frontend/src/api/tasks.ts` with fetchTasks() using VITE_API_URL.
- Created `packages/frontend/src/utils/formatRelativeTime.ts` for relative timestamps.
- Updated HomePage: fetch on mount, loading/empty/error/task-list states, FAB, task cards (min 48px), Retry button.
- Added `packages/frontend/src/vite-env.d.ts` for VITE_API_URL type.
- Added vitest setup: jsdom, @testing-library/jest-dom, setupFiles.
- Added HomePage tests: loading, empty state, task list, error + Retry, Retry refetch.
- Added formatRelativeTime tests.
- All ACs satisfied. Build and tests pass.

### File List

**New files:**
- `packages/frontend/src/api/tasks.ts` — fetchTasks() API client
- `packages/frontend/src/utils/formatRelativeTime.ts` — relative time formatter
- `packages/frontend/src/utils/formatRelativeTime.test.ts` — unit tests
- `packages/frontend/src/vite-env.d.ts` — Vite env types
- `packages/frontend/src/test/setup.ts` — Vitest jest-dom setup

**Modified files:**
- `packages/frontend/src/components/HomePage.tsx` — task list view, empty state, FAB, error handling
- `packages/frontend/src/components/HomePage.test.tsx` — rewritten for new behavior
- `packages/frontend/vite.config.ts` — environment: jsdom, setupFiles
- `packages/frontend/package.json` — @mui/icons-material, @testing-library/*, jsdom, @testing-library/jest-dom

### Senior Developer Review (AI)

**2026-02-18 — Adversarial Code Review**

- **Findings:** 3 Medium, 4 Low (0 Critical, 0 High)
- **Fixed:** M1 (formatRelativeTime invalid date), M2 (AC3 test coverage), M3 (fetch stub isolation), L1 (future dates), L2 (BASE_URL trailing slash), L3 (formatRelativeTime "days ago" test)
- **Outcome:** Approved. All ACs validated. Story marked done.

### Change Log

- 2026-02-18: Story 2.3 implemented — Task list view with empty state, FAB, error handling, tests.
- 2026-02-18: Code review — Fixed formatRelativeTime (invalid/future dates), BASE_URL trailing slash, test isolation, added AC3 3-task/sort-order test.
