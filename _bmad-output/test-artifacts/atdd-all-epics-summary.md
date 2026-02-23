# ATDD Across All Epics - Summary

**Date:** 2026-02-20  
**Scope:** One story per epic with ATDD checklist and failing tests  

---

## Epic Status

| Epic | Status | ATDD Story | Checklist | E2E Spec |
|------|--------|------------|-----------|----------|
| Epic 1 | done | — | — | Infrastructure (1-5); no user-story ATDD |
| Epic 2 | done | — | — | Tests exist (task-workflow, cross-device-sync) |
| Epic 3 | done | — | — | Tests exist (task-lifecycle) |
| Epic 4 | backlog | 4-1, 4-2 | atdd-checklist-4-1.md, atdd-checklist-4-2.md | theme-4-1.spec.ts, responsive-4-2.spec.ts |
| Epic 5 | backlog | 5-1 | atdd-checklist-5-1.md | retry-5-1.spec.ts |
| Epic 6 | backlog | 6-1 | atdd-checklist-6-1.md | accessibility-6-1.spec.ts |

---

## Story Files Created

- `4-2-responsive-layout-with-mobile-first-breakpoints.md`
- `5-1-tanstack-query-retry-logic-with-exponential-backoff.md`
- `6-1-semantic-html-structure-with-landmarks-and-headings.md`

---

## Failing Tests (RED Phase)

All new E2E specs use `test.skip()` — remove when implementing.

| Story | Spec File | Test Count |
|-------|-----------|------------|
| 4-1 | theme-4-1.spec.ts | 4 |
| 4-2 | responsive-4-2.spec.ts | 5 |
| 5-1 | retry-5-1.spec.ts | 3 |
| 6-1 | accessibility-6-1.spec.ts | 6 |

---

## Running Tests

```bash
# Epic 4
pnpm --filter @aine/frontend test:e2e -- theme-4-1
pnpm --filter @aine/frontend test:e2e -- responsive-4-2

# Epic 5
pnpm --filter @aine/frontend test:e2e -- retry-5-1

# Epic 6
pnpm --filter @aine/frontend test:e2e -- accessibility-6-1
```

---

## Next Steps

1. Implement 4-1 per atdd-checklist-4-1.md (theme already partial)
2. Implement 4-2 per atdd-checklist-4-2.md
3. Implement 5-1 per atdd-checklist-5-1.md (requires Story 5.2 for toast)
4. Implement 6-1 per atdd-checklist-6-1.md
5. Run create-story for 4-3 through 4-6, 5-2 through 5-4, 6-2 through 6-5 when ready
6. Run ATDD for remaining stories as needed
