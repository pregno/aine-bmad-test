# Code Review Report: Story 2-3 — Frontend Task List View with Empty State

**Story:** `2-3-frontend-task-list-view-with-empty-state.md`  
**Reviewed:** 2026-02-18  
**Reviewer:** BMad Adversarial Code Review

---

## Summary

**Git vs Story Discrepancies:** 0 (all changes documented)  
**Issues Found:** 0 Critical, 3 Medium, 4 Low

---

## CRITICAL ISSUES

*None.*

---

## MEDIUM ISSUES

### M1 — formatRelativeTime: No handling for invalid ISO strings
**File:** `packages/frontend/src/utils/formatRelativeTime.ts`

If `isoString` is invalid or malformed, `new Date(isoString)` returns `Invalid Date`. Then `date.getTime()` is `NaN`, `diffMs` is `NaN`, and all comparisons fail. The function falls through to `date.toLocaleDateString()` which produces the literal string `"Invalid Date"` displayed to users.

**Fix:** Validate date before use; return fallback (e.g. `""` or `"Unknown date"`) for invalid input.

---

### M2 — AC3: Sort order and multi-task scenario not covered by tests
**File:** `packages/frontend/src/components/HomePage.test.tsx`

Acceptance criterion AC3 explicitly requires:
- 3 task cards displayed
- Cards ordered newest-first

Tests only assert a single-task list. There is no test that:
1. Returns 3 tasks and asserts exactly 3 cards are rendered
2. Verifies order is newest-first (e.g. first card = most recent `createdAt`)

**Fix:** Add test with 3 tasks, assert count and order.

---

### M3 — vi.stubGlobal('fetch') not restored; test isolation risk
**File:** `packages/frontend/src/components/HomePage.test.tsx`

Each test uses `vi.stubGlobal('fetch', ...)` to mock fetch. `vi.restoreAllMocks()` restores `vi.fn()` implementations, but `stubGlobal` replaces the global `fetch` reference. After the suite, `fetch` remains the last mock, which can affect other test files in the same process.

**Fix:** Store original `fetch` in `beforeAll`, restore in `afterEach` (or use Vitest `vi.unstubAllGlobals()` if available).

---

## LOW ISSUES

### L1 — formatRelativeTime: Future dates produce negative "X min ago"
**File:** `packages/frontend/src/utils/formatRelativeTime.ts`

If `createdAt` is in the future (clock skew, bad data), `diffMs` is negative. For `diffMins = -60`, the condition `diffMins < 60` is true and returns `"-60 min ago"`.

**Fix:** Treat negative diffs as `"just now"` or clamp to 0.

---

### L2 — api/tasks.ts: BASE_URL trailing slash causes double slash
**File:** `packages/frontend/src/api/tasks.ts`

If `VITE_API_URL` is `http://localhost:3000/api/v1/`, the concatenation `${BASE_URL}/tasks` yields `.../v1//tasks`. Some servers tolerate this; others do not.

**Fix:** Normalize: `BASE_URL.replace(/\/$/, '') + '/tasks'`.

---

### L3 — formatRelativeTime: No test for "X days ago" branch
**File:** `packages/frontend/src/utils/formatRelativeTime.test.ts`

Current tests cover "just now", "X min ago", and "today". The "X days ago" branch (and the fallback date format) are untested.

**Fix:** Add tests for "2 days ago" and older-date fallback.

---

### L4 — HomePage: No AbortController for fetch on unmount
**File:** `packages/frontend/src/components/HomePage.tsx`

If the component unmounts while `fetch` is in flight, `setState` may run on an unmounted component. React 18 may suppress warnings, but cleanup is best practice.

**Fix:** Use `AbortController`, pass `signal` to `fetch`, abort in `useEffect` cleanup.

---

## AC Validation

| AC | Status | Evidence |
|----|--------|----------|
| AC1 | ✓ Implemented | muiTheme #2196F3, Roboto; Container maxWidth="sm" (600px) |
| AC2 | ✓ Implemented | Empty state text, FAB bottom-right, AddIcon, primary color |
| AC3 | ✓ Implemented | Task cards, text, relative timestamp, minHeight 48, tasks from API (newest-first) |
| AC4 | ✓ Implemented | Error message, Retry button, FAB visible in error state |

---

## Task Audit

All tasks marked [x] are implemented as claimed.

---

## Outcome

**Approved — fixes applied.** All MEDIUM issues fixed. L1, L2, L3 fixed. L4 (AbortController) left as optional follow-up.

### Fixes Applied

- **M1:** formatRelativeTime returns `''` for invalid ISO; validates `date.getTime()` before use
- **M2:** Added test "shows 3 task cards in newest-first order when API returns 3 tasks (AC3)"
- **M3:** Added `beforeAll`/`afterEach` to save and restore `globalThis.fetch`
- **L1:** formatRelativeTime clamps negative diffMs to 0 (future dates → "just now")
- **L2:** api/tasks.ts normalizes BASE_URL with `replace(/\/$/, '')`
- **L3:** Added formatRelativeTime tests for "2 days ago", invalid input, future dates
