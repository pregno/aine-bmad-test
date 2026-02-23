---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests', 'step-04c-aggregate', 'step-05-validate-and-complete']
lastStep: 'step-05-validate-and-complete'
lastSaved: '2026-02-20'
story_id: '4-1'
---

# ATDD Checklist - Epic 4, Story 4.1: Material-UI Theme with Calming Blue Accent and Roboto Typography

**Date:** 2026-02-20
**Author:** Pregno
**Primary Test Level:** Component + E2E

---

## Story Summary

Apply a calming blue (#2196F3) primary color and Roboto typography across the app for a professional, low-stress visual experience. Configure spacing, border radius, and touch targets per UX spec.

**As a** user  
**I want** a visually calming interface with consistent typography  
**So that** the app feels professional and reduces visual stress during busy workdays

---

## Acceptance Criteria

1. **AC1** — Primary #2196F3, secondary neutral gray, Roboto applied to Typography
2. **AC2** — Headings Roboto 500/400, body 16px, line height 1.5
3. **AC3** — 95% monochrome, blue sparingly, standard MUI error/success colors
4. **AC4** — 8px spacing base, 48px touch targets, card padding 16px mobile / 24px desktop
5. **AC5** — 8px border radius for cards/buttons, 50% (circular) for FAB

---

## Failing Tests Created (RED Phase)

### E2E Tests (4 tests)

**File:** `packages/frontend/tests/e2e/theme-4-1.spec.ts`

- ✅ **Test:** FAB uses primary color #2196F3
  - **Status:** RED — FAB may not have exact RGB or may use different selector
  - **Verifies:** AC1 primary color on FAB

- ✅ **Test:** Page uses Roboto font family
  - **Status:** RED — Document body font-family assertion
  - **Verifies:** AC1, AC2 Roboto application

- ✅ **Test:** Task cards have minimum 48px height for touch targets
  - **Status:** RED — Requires task card data-testid or stable class
  - **Verifies:** AC4 touch target height

- ✅ **Test:** Cards use 8px border radius
  - **Status:** RED — Theme shape.borderRadius must be 8
  - **Verifies:** AC5 border radius

### API Tests (0 tests)

**No API endpoints in scope** — Story 4.1 is theme/UI configuration only.

### Component/Unit Tests (5 tests)

**File:** `packages/frontend/src/theme/muiTheme.test.ts`

- ✅ **Test:** has primary color #2196F3 *(existing, passes)*
- ✅ **Test:** uses Roboto font family *(existing, passes)*
- ✅ **Test:** sets base font size to 16px *(existing, passes)*
- ✅ **Test:** has secondary color as neutral gray — **RED** (palette.secondary undefined)
- ✅ **Test:** uses 8px base spacing unit — **RED** (if theme.spacing not 8)
- ✅ **Test:** has 8px border radius for cards and buttons — **RED** (default 4)
- ✅ **Test:** has line height 1.5 — **RED** (typography.body1.lineHeight)
- ✅ **Test:** FAB circular (50% border radius) — **RED** (components.MuiFab)

---

## Required data-testid Attributes

### HomePage / Task Card

- `task-card` — wrapper for each task card (for touch target E2E) *(optional if MuiCard selector works)*

---

## Implementation Checklist

### Test: FAB uses primary color #2196F3

**File:** `packages/frontend/tests/e2e/theme-4-1.spec.ts`

- [ ] Ensure FAB uses `theme.palette.primary.main` (#2196F3)
- [ ] Run: `pnpm --filter @aine/frontend test:e2e -- theme-4-1`
- [ ] Remove `test.skip` when ready
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 0.5 hours

### Test: Page uses Roboto font family

**File:** `packages/frontend/tests/e2e/theme-4-1.spec.ts`

- [ ] Ensure `theme.typography.fontFamily` includes Roboto
- [ ] Ensure Roboto is loaded (e.g. via MUI CssBaseline or font link)
- [ ] Remove `test.skip`
- [ ] ✅ Test passes

**Estimated Effort:** 0.5 hours

### Test: has secondary color as neutral gray

**File:** `packages/frontend/src/theme/muiTheme.ts`

- [ ] Add `palette.secondary: { main: '#9E9E9E' }` (or similar neutral gray)
- [ ] Run: `pnpm --filter @aine/frontend test -- muiTheme`
- [ ] Remove `it.skip`
- [ ] ✅ Test passes

**Estimated Effort:** 0.25 hours

### Test: has 8px border radius

**File:** `packages/frontend/src/theme/muiTheme.ts`

- [ ] Add `shape: { borderRadius: 8 }` to createTheme
- [ ] Remove `it.skip`
- [ ] ✅ Test passes

**Estimated Effort:** 0.25 hours

### Test: has line height 1.5

**File:** `packages/frontend/src/theme/muiTheme.ts`

- [ ] Add `typography.body1: { lineHeight: 1.5 }` (or equivalent)
- [ ] Remove `it.skip`
- [ ] ✅ Test passes

**Estimated Effort:** 0.25 hours

### Test: FAB 50% border radius

**File:** `packages/frontend/src/theme/muiTheme.ts`

- [ ] Add `components.MuiFab.styleOverrides.root.borderRadius: '50%'`
- [ ] Remove `it.skip`
- [ ] ✅ Test passes

**Estimated Effort:** 0.25 hours

---

## Running Tests

```bash
# Run unit tests (theme)
pnpm --filter @aine/frontend test -- muiTheme

# Run E2E theme tests
pnpm --filter @aine/frontend test:e2e -- theme-4-1

# Run all frontend tests
pnpm --filter @aine/frontend test
pnpm --filter @aine/frontend test:e2e
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) ✅

- ✅ Unit tests written (with skip for new assertions)
- ✅ E2E tests written (with skip)
- ✅ Implementation checklist created

### GREEN Phase (Next Steps)

1. Pick one failing test from implementation checklist
2. Implement minimal code to make it pass
3. Remove `test.skip` / `it.skip`, run test
4. Repeat

### REFACTOR Phase (After All Green)

- Ensure theme is consistent, no duplication
- Run full test suite

---

## Next Steps

1. Review this checklist with team
2. Run failing tests: `pnpm --filter @aine/frontend test -- muiTheme`
3. Begin implementation using checklist
4. Un-skip tests one by one as features are implemented

---

**Generated by BMad TEA Agent** - 2026-02-20
