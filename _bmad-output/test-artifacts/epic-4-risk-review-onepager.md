# Epic 4 Risk Review — One-Pager

**Epic:** Mobile-First User Experience & Visual Design  
**Date:** 2026-02-20  
**For:** Team standup / risk review  

---

## High-Priority (Must Mitigate)

| Risk | Score | Description | Action |
|------|-------|-------------|--------|
| **R-001** | 6 | Mobile breakpoint bugs → unusable UI on iOS Safari / Android Chrome | Run E2E in Mobile Chrome viewport; smoke test on real devices before release |

---

## Medium-Priority (Plan Mitigation)

| Risk | Score | Description | Action |
|------|-------|-------------|--------|
| R-002 | 4 | Micro-animations cause jank on low-end devices | Add performance trace in E2E; test with prefers-reduced-motion |
| R-003 | 4 | Date grouping logic errors (Today/Yesterday/This Week/Older) | Unit test `formatRelativeTime`; E2E for date display |
| R-004 | 3 | Typography hierarchy wrong (bold today, faded older) | Component tests for opacity/weight |

---

## Low-Priority (Monitor)

| Risk | Score | Description |
|------|-------|-------------|
| R-005 | 2 | Theme tokens drift from spec |
| R-006 | 1 | Loading spinner blocks on optimistic ops |

---

## Decision Needed

**R-001:** Allocate time for manual smoke on real iOS/Android before Epic 4 release?  
- **Yes** → Add to release checklist  
- **No** → Accept risk; rely on Mobile Chrome viewport only  

---

**Full detail:** `test-design-epic-4.md`
