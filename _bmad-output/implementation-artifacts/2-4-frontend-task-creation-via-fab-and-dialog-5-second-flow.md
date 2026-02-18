# Story 2.4: Frontend - Task Creation via FAB and Dialog (5-Second Flow)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to create a task in under 5 seconds by tapping the FAB and typing,
so that I can capture action items during meetings without breaking focus.

## Acceptance Criteria

**AC1 — FAB opens dialog**
- **Given** I'm on the task list page
- **When** I tap the FAB (floating action button)
- **Then** a Material-UI Dialog opens immediately (no animation delay)
- **And** the dialog contains a TextField with label "What needs to be done?"
- **And** the TextField has autofocus enabled (keyboard appears on mobile)
- **And** the dialog has "Cancel" and "Add Task" buttons

**AC2 — Add task with Add Task button**
- **Given** the add task dialog is open
- **When** I type "Review Sarah's PR" in the text field
- **And** I tap the "Add Task" button
- **Then** the dialog closes immediately
- **And** the new task appears at the top of the task list instantly (optimistic UI)
- **And** the total interaction time from FAB tap to task visible is under 5 seconds (NFR1)

**AC3 — Enter key submits**
- **Given** the add task dialog is open
- **When** I type "Review Sarah's PR" and press Enter on keyboard
- **Then** the dialog closes and the task is created (same as tapping "Add Task" button)

**AC4 — Empty text validation**
- **Given** the add task dialog is open with empty text
- **When** I tap "Add Task"
- **Then** the TextField shows a validation error: "Task text is required"
- **And** the dialog remains open for correction

**AC5 — Cancel or Escape closes without saving**
- **Given** the add task dialog is open
- **When** I tap "Cancel" or press Escape key
- **Then** the dialog closes without creating a task
- **And** any entered text is discarded

**AC6 — 500 character limit**
- **Given** I type text exceeding 500 characters
- **When** I attempt to submit
- **Then** the TextField shows a validation error: "Task text must be 500 characters or less"
- **And** the character count is displayed (e.g., "523/500")

## Tasks / Subtasks

- [x] Task 1: Add createTask to API client (AC2, AC3)
  - [x] Add `createTask(text: string): Promise<CreateTaskResponse>` to `packages/frontend/src/api/tasks.ts`
  - [x] POST `${BASE_URL}/tasks` with body `{ text: string }`
  - [x] Return `{ task: Task }` on 201; throw on 4xx/5xx
  - [x] Use `CreateTaskRequest` and `CreateTaskResponse` from `@aine/shared`

- [x] Task 2: Add AddTaskDialog component (AC1, AC4, AC5, AC6)
  - [x] Create `AddTaskDialog.tsx` with MUI Dialog
  - [x] TextField label: "What needs to be done?"
  - [x] Autofocus input on dialog open
  - [x] Cancel and Add Task buttons
  - [x] Validation: empty → "Task text is required"; >500 chars → "Task text must be 500 characters or less" + character count (e.g., "523/500")
  - [x] Cancel/Escape closes and discards text
  - [x] Trim whitespace before validation and submit

- [x] Task 3: Wire FAB to open dialog and handle submit (AC1, AC2, AC3)
  - [x] Add `open` state for dialog in HomePage (or parent)
  - [x] FAB `onClick` → set open true
  - [x] Dialog `onClose` → set open false, reset form
  - [x] On submit: close dialog immediately, add task optimistically to local state, POST in background
  - [x] If POST succeeds: replace temp task with server response (real id, createdAt)
  - [x] If POST fails: remove optimistic task, show error (inline or reuse existing "Failed to load tasks" pattern for this story)
  - [x] Enter key in TextField submits form

- [x] Task 4: Optimistic UI (AC2)
  - [x] On submit: create temp task `{ id: `temp-${Date.now()}`, text, status: 'ACTIVE', createdAt: new Date().toISOString(), completedAt: null }`
  - [x] Prepend to tasks state immediately, close dialog
  - [x] After POST success: replace temp id with real id in tasks array
  - [x] No TanStack Query — use plain fetch + useState (Story 2.5 adds TanStack Query)

- [x] Task 5: Add tests (AC1–AC6)
  - [x] Test: FAB click opens dialog with TextField and buttons
  - [x] Test: Add Task with valid text creates task and closes dialog
  - [x] Test: Enter key submits like Add Task button
  - [x] Test: Empty text shows validation error, dialog stays open
  - [x] Test: Cancel closes without creating
  - [x] Test: Escape closes without creating
  - [x] Test: 500+ chars shows validation error and character count
  - [x] Mock fetch for POST /tasks

- [x] Task 6: Verify all ACs (AC1–AC6)
  - [x] Run `pnpm --filter frontend test`
  - [ ] Manually: FAB → type → Add Task, verify task at top
  - [x] Run `pnpm lint` → zero new errors

## Dev Notes

### CRITICAL: API Base URL and POST Endpoint

Use `import.meta.env.VITE_API_URL` (same as fetchTasks). Full endpoint: `POST ${VITE_API_URL}/tasks` with body `{ text: string }`. Response 201: `{ task: Task }`.
[Source: packages/frontend/src/api/tasks.ts, technical-architecture-aine-bmad-test-2026-02-17.md]

### CRITICAL: Do NOT Use TanStack Query

Story 2.5 adds TanStack Query with full optimistic updates. This story uses plain `fetch` + `useState`. Implement optimistic UI manually: add temp task to state, POST, on success update with real task, on fail remove and show error.
[Source: epics.md Story 2.4 vs 2.5]

### CRITICAL: Reuse Existing Structure

- HomePage already has: FAB, task list, fetchTasks, loadTasks
- Add: dialog open state, AddTaskDialog component, createTask in api/tasks.ts
- FAB already exists; add `onClick` to open dialog

### Exact Strings (Copy Exactly)

- TextField label: `"What needs to be done?"`
- Add Task button: `"Add Task"`
- Cancel button: `"Cancel"`
- Empty validation: `"Task text is required"`
- Length validation: `"Task text must be 500 characters or less"`
- Character count format: `"${length}/500"` (e.g., "523/500")

### Validation Rules

- **Empty**: After trim, if empty → "Task text is required"
- **Length**: Max 500 characters (backend validates same; frontend validates before submit)
- **Trim**: Trim leading/trailing whitespace before validation and before sending to API

### Previous Story Learnings (Story 2.3)

- **api/tasks.ts**: Uses BASE_URL with trailing slash normalized. Add createTask alongside fetchTasks.
- **HomePage**: Tasks state, loadTasks, FAB. Add dialog state and pass handlers to AddTaskDialog.
- **Tests**: Use vi.stubGlobal('fetch'), ThemeProvider, renderWithTheme. Save/restore original fetch in afterEach for isolation.
- **formatRelativeTime**: Already exists for task timestamps; temp tasks use `new Date().toISOString()`.
[Source: 2-3-frontend-task-list-view-with-empty-state.md]

### File Structure After This Story

```
packages/frontend/src/
├── components/
│   ├── HomePage.tsx        # MODIFIED — dialog state, FAB onClick, createTask flow
│   ├── AddTaskDialog.tsx   # NEW — dialog with TextField, validation, Cancel/Add Task
│   └── ...
├── api/
│   └── tasks.ts            # MODIFIED — add createTask()
└── ...
```

### Architecture Compliance

- **MUI Dialog**: Use MUI Dialog, TextField, Button. No custom modal.
- **Form handling**: Controlled TextField with useState or useReducer. No React Hook Form for MVP (Story 2.4 scope is minimal).
- **API contract**: POST body `{ text: string }`, 201 response `{ task: Task }`, 400 for validation errors.
[Source: technical-architecture-aine-bmad-test-2026-02-17.md#API Specifications]

### UX Requirements (5-Second Flow)

- Dialog opens immediately on FAB tap (no delay)
- Autofocus TextField so keyboard appears without extra tap
- Enter key submits (same as Add Task)
- Optimistic UI: task visible before POST returns
- Cancel/Escape closes and discards
[Source: ux-design-specification.md, epics.md UX-1]

### References

- POST /api/v1/tasks: [Source: 2-1-backend-api-create-task-endpoint.md, technical-architecture]
- MUI Dialog: https://mui.com/material-ui/react-dialog/
- CreateTaskRequest, CreateTaskResponse: [Source: packages/shared/src/types/api.ts]

## Dev Agent Record

### Agent Model Used

Cursor Composer

### Debug Log References

N/A

### Completion Notes List

- Added `createTask(text)` to `packages/frontend/src/api/tasks.ts`
- Created `AddTaskDialog.tsx` with MUI Dialog, TextField, validation (empty, >500 chars), Cancel/Add Task, Enter/Escape handling
- Wired FAB in HomePage to open dialog; optimistic UI with temp task, POST in background, replace on success, remove + error on fail
- Tests: AC1–AC6 covered in HomePage.test.tsx with cleanup between tests to avoid DOM pollution; used `within(dialog)` for AC6
- Fixed AddTaskDialog helperText for length error to show both message and character count (e.g., "Task text must be 500 characters or less 523/500")

### File List

- `packages/frontend/src/api/tasks.ts` — MODIFIED (createTask)
- `packages/frontend/src/components/AddTaskDialog.tsx` — NEW
- `packages/frontend/src/components/HomePage.tsx` — MODIFIED (dialog state, FAB onClick, handleAddTask)
- `packages/frontend/src/components/HomePage.test.tsx` — MODIFIED (AC1–AC6 tests)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — MODIFIED (story status sync)

### Change Log

| Date       | Change                                                                 |
|------------|------------------------------------------------------------------------|
| 2026-02-18 | Implemented createTask API, AddTaskDialog, FAB wiring, optimistic UI   |
| 2026-02-18 | Added tests for AC1–AC6; fixed test isolation (cleanup), AC6 validation display |
| 2026-02-18 | Review fixes: no-dialog-delay, AC5 Escape test, create-error messaging, request typing |

## Senior Developer Review (AI)

### Reviewer

Pregno

### Date

2026-02-18

### Outcome

Approved after fixes

### Findings Resolved

- AC1 compliance improved by removing dialog transition delay (`transitionDuration={0}`)
- AC6 realistic behavior fixed by removing input max-length cap that prevented >500 character validation scenarios
- Missing AC5 Escape-path test added (`Escape closes without creating`)
- Create failure messaging now shows the correct runtime error string instead of always showing load-failure copy
- API client now uses `CreateTaskRequest` type in addition to `CreateTaskResponse`
- Story File List updated to include `sprint-status.yaml` change for traceability
