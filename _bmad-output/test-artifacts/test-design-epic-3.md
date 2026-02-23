# Test Design: Epic 3 - Task Lifecycle - Completion & Deletion

**Date:** 2026-02-20  
**Author:** Pregno  
**Status:** Complete (All Stories Done) — Reference / Retrospective  

---

## Executive Summary

**Scope:** Test design for Epic 3 (Task Lifecycle - Completion & Deletion)

**Note:** Epic 3 is **in-progress** per sprint-status with all 8 stories **done**. This document serves as a reference test plan for completion, delete, bulk clear, and 24h auto-delete validation.

**Risk Summary:**

- Total risks identified: 6
- High-priority risks (≥6): 1
- Critical categories: DATA, BUS

**Coverage Summary:**

- P0 scenarios: 14 (~18–28 hours)
- P1 scenarios: 20 (~16–24 hours)
- P2/P3 scenarios: 12 (~8–14 hours)
- **Total effort**: ~42–65 hours

---

## Not in Scope

| Item | Reasoning | Mitigation |
|------|----------|------------|
| Epic 4 (Responsive, Theme) | Different epic | test-design-epic-4 |
| Epic 5 (Retry, Offline) | Different epic | test-design-epic-5 |
| Swipe gesture unit tests | jsdom TouchEvent unreliable | E2E + manual; Story 3.5 dev notes |
| Cron job in CI (24h wait) | Impractical | Unit/integration with mocked time or direct API |

---

## Risk Assessment (Retrospective)

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | P | I | Score | Mitigation | Owner | Timeline |
|---------|----------|-------------|---|---|-------|------------|-------|----------|
| R-001 | DATA | Bulk delete removes active tasks by mistake | 2 | 3 | 6 | Integration test: only completed deleted; E2E clear-all asserts | Dev | Pre-release |

### Medium-Priority Risks (Score 3–4)

| Risk ID | Category | Description | P | I | Score | Mitigation | Owner |
|---------|----------|-------------|---|---|-------|------------|-------|
| R-002 | BUS | Accidental delete without confirmation | 2 | 2 | 4 | E2E: swipe → confirm dialog; Cancel preserves task | QA |
| R-003 | BUS | Complete/delete optimistic rollback fails | 2 | 2 | 4 | Component + E2E for fail-after-mutation | Dev |
| R-004 | OPS | 24h cron deletes too early or fails silently | 2 | 2 | 4 | Integration test with mocked time; cron job unit test | Dev |

### Low-Priority Risks (Score 1–2)

| Risk ID | Category | Description | P | I | Score | Action |
|---------|----------|-------------|---|---|-------|--------|
| R-005 | BUS | Collapse state not persisted | 1 | 2 | 2 | Component test LocalStorage | Dev |
| R-006 | TECH | Swipe threshold too sensitive | 1 | 1 | 1 | E2E + manual; tune if reported |

### Risk Category Legend

- **TECH**: Technical/Architecture
- **SEC**: Security
- **PERF**: Performance
- **DATA**: Data Integrity
- **BUS**: Business Impact (UX harm)
- **OPS**: Operations

---

## Entry Criteria (Met)

- [x] Epic 2 complete (create, list, sync)
- [x] PATCH, DELETE endpoints implemented

## Exit Criteria (Met)

- [x] All Epic 3 stories done
- [x] Complete, delete, clear-all, cron working
- [x] task-lifecycle.spec.ts passing

---

## Test Coverage Plan

**Note:** P0/P1/P2/P3 = priority/risk classification, NOT execution timing.

### P0 (Critical)

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
|-------------|------------|-----------|------------|-------|-------|
| 3.1 PATCH complete 200 + completedAt | Integration + E2E | - | 2 | Dev | task-workflow API, task-lifecycle |
| 3.1 PATCH 404, 400 invalid status | Integration | - | 2 | Dev | |
| 3.2 DELETE 204, task removed | Integration + E2E | R-002 | 2 | Dev | task-workflow API, task-lifecycle |
| 3.2 DELETE 404 | Integration | - | 1 | Dev | |
| 3.3 DELETE completed 200 + deletedCount | Integration | R-001 | 1 | Dev | Only completed deleted |
| 3.4 Complete task → moves to completed section | E2E | - | 2 | QA | task-lifecycle.spec.ts |
| 3.5 Swipe → confirm → delete | E2E | R-002 | 1 | QA | task-lifecycle (or task-workflow) |
| 3.7 Clear all completed + success toast | E2E | R-001 | 2 | QA | task-lifecycle.spec.ts |
| 3.8 Cron deletes only >24h | Integration | R-004 | 1 | Dev | Mock time or direct cleanup call |

**Total P0**: 14 tests

### P1 (High)

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
|-------------|------------|-----------|------------|-------|-------|
| 3.1 PATCH toggle ACTIVE ↔ COMPLETED | Integration | - | 1 | Dev | |
| 3.3 DELETE completed, 0 when none | Integration | - | 1 | Dev | |
| 3.4 Optimistic complete + rollback on fail | Component | R-003 | 2 | Dev | HomePage.test |
| 3.5 Delete confirm Cancel preserves task | E2E | R-002 | 1 | QA | |
| 3.5 Delete fail → task reappears + toast | Component | R-003 | 1 | Dev | |
| 3.6 Completed section expand/collapse | E2E | - | 2 | QA | task-lifecycle |
| 3.6 Completed count badge updates | E2E | - | 1 | QA | |
| 3.6 No completed section when empty | E2E | - | 1 | QA | |
| 3.7 Clear confirm Cancel preserves | E2E | R-002 | 1 | QA | |
| 3.7 Clear fail → tasks reappear + toast | Component | R-003 | 1 | Dev | |
| 3.7 Button hidden when no completed | E2E | - | 1 | QA | |
| 3.8 Cron logs, no crash on DB fail | Integration | R-004 | 1 | Dev | |
| 3.4 Un-complete (tap completed task) | E2E | - | 1 | QA | |

**Total P1**: 20 tests

### P2/P3 (Medium / Low)

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
|-------------|------------|-----------|------------|-------|-------|
| 3.6 Collapse state LocalStorage persist | Component | R-005 | 1 | Dev | |
| 3.5 Desktop hover delete icon | E2E | - | 1 | QA | |
| 3.5 Swipe-right undo | E2E | - | 1 | QA | |
| 3.4 Animation duration (~300ms) | E2E | - | 1 | QA | Optional |
| 3.7 Staggered fade-out | E2E | - | 1 | QA | Optional |
| 3.8 Cron schedule registration | Unit | R-004 | 1 | Dev | |
| 3.8 Zero deleted when all recent | Integration | - | 1 | Dev | |

**Total P2/P3**: 12 tests

---

## Execution Strategy

| Timing | Scope | Duration |
|--------|-------|----------|
| **Every PR** | All E2E + integration + unit | ~12–18 min |
| **CI** | Full suite with Docker | ~15–20 min |

---

## Resource Estimates

| Priority | Count | Effort (Interval) | Notes |
|----------|-------|-------------------|-------|
| P0 | 14 | ~18–28 hours | Epic done; retrospective |
| P1 | 20 | ~16–24 hours | |
| P2/P3 | 12 | ~8–14 hours | |
| **Total** | **46** | **~42–65 hours** | |

---

## Quality Gate Criteria

- **P0 pass rate**: 100%
- **P1 pass rate**: ≥95%
- **Coverage**: ≥80%
- **R-001**: Bulk delete only removes completed tasks

---

## Interworking & Regression

| Service/Component | Impact | Regression Scope |
|-------------------|--------|-------------------|
| PATCH /api/v1/tasks/:id | Complete flow | task-workflow API, task-lifecycle |
| DELETE /api/v1/tasks/:id | Single delete | task-workflow API |
| DELETE /api/v1/tasks/completed | Bulk clear | task-lifecycle |
| HomePage / SwipeableTaskCard | Complete, delete, clear | HomePage.test, task-lifecycle |
| Cron cleanup | 24h auto-delete | Backend integration |

---

## Appendix

### Related Documents

- Epic: `_bmad-output/planning-artifacts/epics.md` (Epic 3)
- Architecture: `_bmad-output/planning-artifacts/technical-architecture-aine-bmad-test-2026-02-17.md`
- E2E: `packages/frontend/tests/e2e/task-lifecycle.spec.ts`

---

**Generated by:** BMad TEA Agent - Test Architect Module  
**Workflow:** `_bmad/tea/testarch/test-design`  
**Version:** 5.0
