# Story 3.6: Frontend - Completed Tasks Section with Collapse/Expand

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want completed tasks to collapse into a separate section below active tasks,
so that I can focus on active work while still seeing my progress.

## Acceptance Criteria

**AC1 — Completed section collapsed by default**
- **Given** I have 5 active tasks and 8 completed tasks
- **When** the task list loads
- **Then** active tasks appear at the top in their own section (no header needed)
- **And** completed tasks appear in a collapsible section below with header "Completed (8)"
- **And** the completed section is collapsed by default (only header visible, no task cards)

**AC2 — Tap header expands section**
- **Given** the completed section is collapsed
- **When** I tap the "Completed (8)" header
- **Then** the section expands with smooth animation (~300ms)
- **And** all 8 completed tasks become visible with strikethrough text
- **And** the header icon changes from chevron-down to chevron-up

**AC3 — Tap header again collapses section**
- **Given** the completed section is expanded
- **When** I tap the "Completed (8)" header again
- **Then** the section collapses with smooth animation
- **And** only the header remains visible

**AC4 — Count badge updates while section stays collapsed**
- **Given** I complete a task while the completed section is collapsed
- **When** the task moves to the completed section
- **Then** the completed count badge updates (e.g., "Completed (8)" → "Completed (9)")
- **And** the section remains collapsed (does not auto-expand)

**AC5 — Completed section hidden when no completed tasks**
- **Given** I have no completed tasks
- **When** the task list loads
- **Then** the completed section is not visible at all
- **And** only active tasks are shown

**AC6 — Collapse/expand state persists across page refreshes**
- **Given** the completed section collapse/expand state is changed
- **When** I change the state and the component remounts (simulating refresh)
- **Then** the section opens in the previously selected state (preference saved in LocalStorage)

## Tasks / Subtasks

- [x] **Task 1: Add `isCompletedExpanded` state with LocalStorage persistence** (AC1, AC6)
  - [x] Add `isCompletedExpanded: boolean` state to `packages/frontend/src/components/HomePage.tsx`
  - [x] Initialize state lazily from `localStorage.getItem('aine-completed-expanded')` — default `false` if missing
  - [x] Wrap localStorage access in `try/catch` to handle unavailable storage gracefully

- [x] **Task 2: Add `handleToggleCompleted` callback** (AC2, AC3, AC6)
  - [x] Create `handleToggleCompleted` using `useCallback` that flips `isCompletedExpanded`
  - [x] Write the new value to `localStorage.setItem('aine-completed-expanded', String(next))` inside the toggle (also wrapped in try/catch)

- [x] **Task 3: Convert completed section header to clickable toggle** (AC2, AC3)
  - [x] Replace the static `<Typography variant="subtitle2">` header with a clickable `<Box component="button">` that calls `handleToggleCompleted`
  - [x] Add `ExpandMoreIcon` (when collapsed) / `ExpandLessIcon` (when expanded) from `@mui/icons-material`
  - [x] Add `aria-expanded={isCompletedExpanded}` for accessibility
  - [x] Style: flex row, `alignItems: 'center'`, `gap: 0.5`, no native button chrome (`border: 'none'`, `background: 'none'`, `p: 0`), `cursor: 'pointer'`, `mb: 1`, `width: '100%'`, `textAlign: 'left'`
  - [x] `data-testid="completed-section-toggle"` for test accessibility

- [x] **Task 4: Wrap completed task list in MUI `<Collapse>`** (AC1, AC2, AC3)
  - [x] Import `Collapse` from `@mui/material`
  - [x] Wrap the `<Box>` containing the `SwipeableTaskCard` list in `<Collapse in={isCompletedExpanded} timeout={300}>`
  - [x] The header ("Completed (N)" + chevron) always renders when `completedTasks.length > 0` regardless of `isCompletedExpanded`
  - [x] The `<Collapse>` only controls visibility of the task cards, not the header

- [x] **Task 5: Write unit tests** (AC1–AC6)
  - [x] Add tests to `packages/frontend/src/components/HomePage.test.tsx`
  - [x] Test AC1: completed section header visible, tasks hidden by default
  - [x] Test AC2: clicking header expands section (tasks become visible)
  - [x] Test AC3: clicking header twice collapses section again
  - [x] Test AC4: count updates while section stays collapsed after completing a task
  - [x] Test AC5: no completed section visible when no completed tasks
  - [x] Test AC6: state persists via localStorage (set before render → expanded on mount)

- [x] **Task 6: Verify all ACs**
  - [x] Run `pnpm --filter frontend test` → 53 tests pass (47 prior + 6 new)
  - [x] Run `pnpm --filter frontend lint` → zero errors
  - [x] Run `pnpm --filter frontend type-check` → no type errors

## Dev Notes

### CRITICAL: Only `HomePage.tsx` needs to change

This story is a focused UI enhancement to the completed section in `HomePage.tsx`. **No new files are needed** (no new hooks, no new API functions). The only source files modified are:
- `packages/frontend/src/components/HomePage.tsx` — add collapse/expand logic
- `packages/frontend/src/components/HomePage.test.tsx` — add 6 new tests

### CRITICAL: `Collapse` component from MUI for animation

Use MUI's `<Collapse>` for the smooth height animation. Do **not** use CSS `display: none` (no animation) or `max-height` hacks. MUI `Collapse` handles the `~300ms` ease-in-out height transition automatically.

```typescript
import { Collapse } from '@mui/material'; // add to existing MUI import

// In JSX:
<Collapse in={isCompletedExpanded} timeout={300}>
  <Box>
    {completedTasks.map((task) => (
      <SwipeableTaskCard key={task.id} task={task} onToggle={handleToggleTask} onDelete={handleDeleteTask} fadeInOnMount={rollbackFadeTaskId === task.id} />
    ))}
  </Box>
</Collapse>
```

### CRITICAL: Icons from `@mui/icons-material`

`ExpandMoreIcon` and `ExpandLessIcon` are already available in the installed `@mui/icons-material` package (same package used for `CheckCircleIcon`, `DeleteIcon`, `AddIcon`):

```typescript
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
```

### CRITICAL: LocalStorage Initialization Pattern

Initialize state lazily with a function argument to `useState` so localStorage is only read once:

```typescript
const COMPLETED_EXPANDED_KEY = 'aine-completed-expanded';

const [isCompletedExpanded, setIsCompletedExpanded] = useState<boolean>(() => {
  try {
    return localStorage.getItem(COMPLETED_EXPANDED_KEY) === 'true';
  } catch {
    return false; // localStorage unavailable (e.g., private browsing with strict settings)
  }
});
```

Write to localStorage inside the toggle callback:

```typescript
const handleToggleCompleted = useCallback(() => {
  setIsCompletedExpanded((prev) => {
    const next = !prev;
    try {
      localStorage.setItem(COMPLETED_EXPANDED_KEY, String(next));
    } catch {
      // localStorage unavailable — state still updates in memory
    }
    return next;
  });
}, []);
```

### CRITICAL: Header Button JSX Pattern

Replace the existing `<Typography variant="subtitle2">` header with:

```typescript
<Box
  component="button"
  onClick={handleToggleCompleted}
  aria-expanded={isCompletedExpanded}
  data-testid="completed-section-toggle"
  sx={{
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    p: 0,
    mb: 1,
    width: '100%',
    textAlign: 'left',
  }}
>
  <Typography variant="subtitle2" color="text.secondary">
    Completed ({completedTasks.length})
  </Typography>
  {isCompletedExpanded ? (
    <ExpandLessIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
  ) : (
    <ExpandMoreIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
  )}
</Box>
```

### CRITICAL: What does NOT change

- **`SwipeableTaskCard`**: unchanged — already handles delete, toggle, animations
- **Active tasks section**: unchanged — no collapse for active tasks
- **`handleToggleTask`, `handleDeleteTask`**: unchanged
- **The `rollbackFadeTaskId` pattern**: pass through as-is to `SwipeableTaskCard`

### Test Pattern for Collapse/Expand

The `<Collapse in={false}>` component hides content but still renders it in the DOM (hidden via CSS height). Use `expect(element).not.toBeVisible()` (or check that the collapse region's height is 0) rather than `not.toBeInTheDocument()`.

However, `@testing-library/react` and jsdom don't compute CSS `height: 0` from MUI Collapse — the elements are still technically in the DOM but inside a container with `height: 0; overflow: hidden`. In tests, `screen.queryByText` may find the text even when collapsed.

**The correct approach**: test that the button label is visible/in-DOM, and test clicking triggers state changes. For collapsed state, assert the toggle button is present and `aria-expanded="false"`. For expanded, assert `aria-expanded="true"` and tasks are visible.

```typescript
// AC1: collapsed by default
expect(screen.getByTestId('completed-section-toggle')).toHaveAttribute('aria-expanded', 'false');

// AC2: clicking expands
await userEvent.click(screen.getByTestId('completed-section-toggle'));
expect(screen.getByTestId('completed-section-toggle')).toHaveAttribute('aria-expanded', 'true');

// AC6: localStorage test — set value before render
localStorage.setItem('aine-completed-expanded', 'true');
renderWithTheme(<HomePage />);
// ... wait for tasks ...
expect(screen.getByTestId('completed-section-toggle')).toHaveAttribute('aria-expanded', 'true');
```

**Important**: Clear `localStorage` between tests to prevent state leakage:
```typescript
afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;
  onlineManager.setOnline(true);
  vi.useRealTimers();
  localStorage.clear(); // ← Add this line to existing afterEach
});
```

### Previous Story Learnings (Stories 3.4, 3.5)

- **`fireEvent.click` for hidden buttons** (pointer-events: none): `fireEvent.click` works even on elements that are visually hidden via CSS. Use it to trigger interactions on non-interactive elements.
- **`useCallback` deps**: ensure `handleToggleCompleted` has correct deps (none needed if using the functional updater `setIsCompletedExpanded(prev => !prev)`).
- **`data-testid` for toggle button**: always add `data-testid` to interactive elements for reliable test targeting.
- **Import order**: add `Collapse` to the existing MUI import line, `ExpandMoreIcon`/`ExpandLessIcon` as new icon imports.
[Source: packages/frontend/src/components/HomePage.tsx, packages/frontend/src/components/HomePage.test.tsx]

### File Structure After This Story

```
packages/frontend/src/
├── api/
│   └── tasks.ts                          # unchanged
├── hooks/
│   ├── useCreateTaskMutation.ts          # unchanged
│   ├── useTasksQuery.ts                  # unchanged
│   ├── useUpdateTaskStatusMutation.ts    # unchanged
│   └── useDeleteTaskMutation.ts          # unchanged
├── components/
│   ├── HomePage.tsx                      # MODIFIED — add collapse/expand to completed section
│   ├── HomePage.test.tsx                 # MODIFIED — add 6 new collapse/expand tests
│   ├── SwipeableTaskCard.tsx             # unchanged
│   ├── AddTaskDialog.tsx                 # unchanged
│   └── ...
└── ...
```

### Architecture Compliance

- **No new dependencies**: `Collapse`, `ExpandMoreIcon`, `ExpandLessIcon` already available from installed packages
- **LocalStorage**: React architecture decision (ARCH-2) allows LocalStorage for user preferences
- **No new API calls**: purely UI state change
- **CSS-only animation via MUI**: `Collapse` uses CSS height transitions internally — satisfies the "~300ms" spec
[Source: technical-architecture-aine-bmad-test-2026-02-17.md]

### References

- MUI Collapse: https://mui.com/material-ui/transitions/#collapse
- MUI icons (Expand): https://mui.com/material-ui/material-icons/?query=expand
- LocalStorage initialization in React useState: [lazy initial state pattern]
- Story 3.5 completed section code: [Source: packages/frontend/src/components/HomePage.tsx lines 170–187]

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Debug Log References

- **Debug 1**: `localStorage.clear is not a function` — jsdom in this project does not provide a full Web Storage API implementation (missing `clear`, `setItem`). Fix: added an in-memory `localStorageMock` object in `HomePage.test.tsx` and registered it via `vi.stubGlobal('localStorage', localStorageMock)` in `beforeAll`. This allows `localStorage.getItem/setItem/clear` to work in tests and in `HomePage.tsx`'s lazy state initializer.

### Completion Notes List

- Added `COMPLETED_EXPANDED_KEY = 'aine-completed-expanded'` constant outside the component in `HomePage.tsx`
- Added `isCompletedExpanded` state with lazy `localStorage.getItem` init (default `false` = collapsed) and `try/catch` for unavailable storage
- Added `handleToggleCompleted` callback: flips state and writes to `localStorage.setItem` (also in `try/catch`)
- Converted static `<Typography>` completed-section header to `<Box component="button">` with `aria-expanded`, `data-testid="completed-section-toggle"`, `ExpandMoreIcon`/`ExpandLessIcon` (collapsed/expanded state), and proper button-reset styles
- Wrapped completed task list in `<Collapse in={isCompletedExpanded} timeout={300}>` — header always renders when `completedTasks.length > 0`, only task cards collapse/expand
- Added in-memory `localStorageMock` to `HomePage.test.tsx` (via `vi.stubGlobal` in `beforeAll`); `localStorageMock.clear()` called in `afterEach` to prevent test leakage
- Added 6 new tests covering AC1–AC6: collapsed-by-default, expand on click, collapse again, count updates while collapsed, hidden when no completed tasks, localStorage persistence
- All 53 tests pass, lint clean, type-check clean
- Code-review fixes: added `unmountOnExit` to completed `<Collapse>` so collapsed cards are not mounted, strengthened AC1 hidden-cards assertion, added AC2 chevron icon assertion, and extended AC6 to verify toggle→persist→remount behavior
- Updated pre-existing completed-task tests (toggle/un-complete/strikethrough/delete accessibility) to explicitly expand the completed section before asserting card-level behavior

### File List

- `packages/frontend/src/components/HomePage.tsx` — MODIFIED (added Collapse, expand/collapse icons, isCompletedExpanded state, handleToggleCompleted, clickable header, Collapse wrapper)
- `packages/frontend/src/components/HomePage.test.tsx` — MODIFIED (in-memory localStorage mock, localStorageMock.clear() in afterEach, 6 new Story 3.6 tests)
- `_bmad-output/implementation-artifacts/3-6-frontend-completed-tasks-section-with-collapse-expand.md` — MODIFIED (story progress)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — MODIFIED (story status: ready-for-dev → in-progress → review)

### Change Log

| Date | Change |
|------|--------|
| 2026-02-18 | Story created |
| 2026-02-18 | Implemented all tasks: isCompletedExpanded state, handleToggleCompleted, clickable header with chevrons, MUI Collapse wrapper, localStorage mock fix, 6 new tests; all 53 tests pass, lint clean, type-check clean |
| 2026-02-20 | Code review fixes applied: unmount completed section on collapse, strengthen AC1/AC2/AC6 tests, and align legacy completed-task tests with collapsed-by-default behavior |

## Senior Developer Review (AI)

### Reviewer

Pregno

### Date

2026-02-20

### Outcome

Approved after fixes

### Findings Resolved

- Added `unmountOnExit` to `<Collapse>` so completed cards are not mounted while collapsed (AC1 behavior/performance)
- Strengthened AC1 test to assert completed task cards are not present when collapsed
- Strengthened AC2 test to verify chevron icon transitions (`ExpandMoreIcon` → `ExpandLessIcon`)
- Strengthened AC6 test to verify state persistence across user toggle and remount (simulated refresh)
