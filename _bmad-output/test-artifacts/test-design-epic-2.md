# Test Design: Epic 2 - Core Task Management - Capture & Storage

**Date:** 2026-02-20  
**Author:** Pregno  
**Status:** Complete (Epic Done) — Reference / Retrospective  

---

## Executive Summary

**Scope:** Test design for Epic 2 (Core Task Management - Capture & Storage)

**Note:** Epic 2 is **done** per sprint-status. This document serves as a reference test plan for capture/storage validation and regression when changes affect task CRUD or sync.

**Risk Summary:**

- Total risks identified: 6
- High-priority risks (≥6): 1
- Critical categories: DATA, BUS

**Coverage Summary:**

- P0 scenarios: 12 (~15–24 hours)
- P1 scenarios: 16 (~14–20 hours)
- P2/P3 scenarios: 10 (~6–12 hours)
- **Total effort**: ~35–55 hours

---

## Not in Scope

| Item | Reasoning | Mitigation |
|------|----------|------------|
| Epic 3 (Completion, Delete) | Different epic | task-lifecycle.spec.ts |
| Epic 4 (Responsive, Theme) | Different epic | test-design-epic-4 |
| Epic 5 (Retry, Offline) | Different epic | test-design-epic-5 |
| Real-time WebSocket sync | Not in scope | TanStack refetch sufficient |

---

## Risk Assessment (Retrospective)

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | P | I | Score | Mitigation | Owner | Timeline |
|---------|----------|-------------|---|---|-------|------------|-------|----------|
| R-001 | DATA | Tasks lost on refresh or cross-session (persistence failure) | 2 | 3 | 6 | E2E persistence test; integration tests for POST/GET | Dev | Pre-release |

### Medium-Priority Risks (Score 3–4)

| Risk ID | Category | Description | P | I | Score | Mitigation | Owner |
|---------|----------|-------------|---|---|-------|------------|-------|
| R-002 | BUS | Optimistic UI rollback fails → user sees phantom task | 2 | 2 | 4 | Component + E2E for fail-after-create | Dev |
| R-003 | TECH | Sort order wrong (active/completed, newest/oldest) | 2 | 2 | 4 | Integration test GET sort; E2E order assert | Dev |
| R-004 | DATA | Cross-device inconsistency (stale cache) | 1 | 3 | 3 | cross-device-sync E2E; refetch on focus | QA |

### Low-Priority Risks (Score 1–2)

| Risk ID | Category | Description | P | I | Score | Action |
|---------|----------|-------------|---|---|-------|--------|
| R-005 | BUS | 5-second flow exceeded (NFR1) | 1 | 2 | 2 | E2E timing assert optional |
| R-006 | TECH | Temp ID not replaced with server ID | 1 | 1 | 1 | Unit/component for mutation cache update |

### Risk Category Legend

- **TECH**: Technical/Architecture
- **SEC**: Security
- **PERF**: Performance
- **DATA**: Data Integrity
- **BUS**: Business Impact (UX harm)
- **OPS**: Operations

---

## Entry Criteria (Historical)

- [x] Epic 1 complete (Docker, backend, frontend, tests)
- [x] PostgreSQL + Prisma schema ready

## Exit Criteria (Met)

- [x] All Epic 2 stories done
- [x] POST/GET API working; validation (empty, 500 chars)
- [x] Task list, empty state, FAB, dialog, optimistic UI
- [x] Cross-device sync validated

---

## Test Coverage Plan

**Note:** P0/P1/P2/P3 = priority/risk classification, NOT execution timing.

### P0 (Critical)

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
|-------------|------------|-----------|------------|-------|-------|
| 2.1 POST create task 201 + persist | Integration + E2E | R-001 | 2 | Dev | tasks.create.test.ts, task-workflow |
| 2.1 POST validation (empty, 500+ chars) | Integration + E2E | - | 2 | Dev | 400 responses |
| 2.2 GET tasks sort (active first, newest-first) | Integration | R-003 | 1 | Dev | tasks.get.test.ts |
| 2.2 GET empty array | Integration | - | 1 | Dev | |
| 2.3 Empty state + FAB visible | E2E | - | 1 | QA | smoke, task-workflow |
| 2.4 Create via FAB/dialog, task appears | E2E | R-001 | 2 | QA | task-workflow.spec.ts |
| 2.5 Optimistic UI + rollback on fail | Component/E2E | R-002 | 2 | Dev | HomePage.test, route intercept |
| 2.6 Cross-device task visible | E2E | R-004 | 1 | QA | cross-device-sync.spec.ts |

**Total P0**: 12 tests

### P1 (High)

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
|-------------|------------|-----------|------------|-------|-------|
| 2.4 Cancel, Escape, Enter submit | E2E | - | 3 | QA | task-workflow |
| 2.4 Validation (empty, 500) in dialog | E2E | - | 2 | QA | |
| 2.5 Rapid create (3 tasks) + temp ID replace | Component | R-006 | 2 | Dev | HomePage.test |
| 2.5 Persist across reload | E2E | R-001 | 1 | QA | task-workflow |
| 2.6 Task fields parity (id, text, status, timestamps) | E2E | R-004 | 2 | QA | cross-device-sync |
| 2.6 Fresh device loads all tasks | E2E | R-001 | 1 | QA | cross-device-sync |
| 2.3 Error state (Failed to load, Retry) | E2E | - | 2 | QA | |
| 2.3 Relative timestamp display | E2E | - | 1 | QA | task-workflow |

**Total P1**: 16 tests

### P2/P3 (Medium / Low)

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
|-------------|------------|-----------|------------|-------|-------|
| 2.1 500 on DB fail, no sensitive data | Integration | - | 1 | Dev | |
| 2.2 completedAt null for active | Integration | - | 1 | Dev | |
| 2.4 5-second flow timing (NFR1) | E2E | R-005 | 1 | QA | Optional |
| 2.5 Retry button on fail | Component | R-002 | 1 | Dev | |
| 2.6 Refetch interval (30s) | Unit | - | 1 | Dev | Config assert |

**Total P2/P3**: 10 tests

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
| P0 | 12 | ~15–24 hours | Epic done; estimates retrospective |
| P1 | 16 | ~14–20 hours | |
| P2/P3 | 10 | ~6–12 hours | |
| **Total** | **38** | **~35–55 hours** | |

---

## Quality Gate Criteria

- **P0 pass rate**: 100%
- **P1 pass rate**: ≥95%
- **Coverage**: ≥80%
- **R-001**: Persistence and cross-device E2E passing

---

## Interworking & Regression

| Service/Component | Impact | Regression Scope |
|-------------------|--------|-------------------|
| POST /api/v1/tasks | Create flow | task-workflow, tasks.create.test |
| GET /api/v1/tasks | List + sort | tasks.get.test, HomePage |
| HomePage / AddTaskDialog | Capture flow | HomePage.test, task-workflow |
| TanStack Query | Optimistic, refetch | HomePage.test, cross-device-sync |

---

## Appendix

### Related Documents

- Epic: `_bmad-output/planning-artifacts/epics.md` (Epic 2)
- Architecture: `_bmad-output/planning-artifacts/technical-architecture-aine-bmad-test-2026-02-17.md`
- Test summary: `_bmad-output/implementation-artifacts/tests/test-summary.md`

---

**Generated by:** BMad TEA Agent - Test Architect Module  
**Workflow:** `_bmad/tea/testarch/test-design`  
**Version:** 5.0
