# Test Design: Epic 5 - Network Resilience & Optimistic UI

**Date:** 2026-02-20  
**Author:** Pregno  
**Status:** Draft  

---

## Executive Summary

**Scope:** Full test design for Epic 5 (Network Resilience & Optimistic UI)

**Risk Summary:**

- Total risks identified: 6
- High-priority risks (≥6): 1
- Critical categories: DATA, BUS

**Coverage Summary:**

- P0 scenarios: 10 (~15–25 hours)
- P1 scenarios: 18 (~15–22 hours)
- P2/P3 scenarios: 14 (~8–14 hours)
- **Total effort**: ~38–60 hours (~1–1.5 weeks)

---

## Not in Scope

| Item | Reasoning | Mitigation |
|------|----------|------------|
| Epic 6 (Accessibility) | Not yet implemented | WCAG tests when epic starts |
| Chaos engineering (network partition simulation) | Out of scope for MVP | Manual flaky-network testing |
| IndexedDB cross-session persistence | Story 5.3 may use TanStack cache only | Clarify with Dev; add IndexedDB tests if implemented |
| Load testing (retry storms) | NFR; separate performance suite | k6/artillery if needed later |

---

## Risk Assessment

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | P | I | Score | Mitigation | Owner | Timeline |
|---------|----------|-------------|---|---|-------|------------|-------|----------|
| R-001 | DATA | Offline-created tasks lost on refresh before sync (no persistence) | 2 | 3 | 6 | Unit + E2E for offline queue; verify TanStack/IndexedDB persistence | Dev | Pre-release |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description | P | I | Score | Mitigation | Owner |
|---------|----------|-------------|---|---|-------|------------|-------|
| R-002 | BUS | Error toast not shown or Retry fails → user stuck | 2 | 2 | 4 | E2E for fail-after-retries; component test for toast visibility | Dev |
| R-003 | TECH | Retry backoff wrong or race between concurrent mutations | 2 | 2 | 4 | Unit test retry intervals; E2E rapid multi-mutation | Dev |
| R-004 | OPS | Backend error responses expose stack traces or DB details | 1 | 3 | 3 | Integration test 500/504; assert no sensitive data in body | Dev |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description | P | I | Score | Action |
|---------|----------|-------------|---|---|-------|--------|
| R-005 | PERF | Multiple toasts stack poorly (UI jank) | 1 | 2 | 2 | Component test toast stacking; manual spot-check |
| R-006 | BUS | Offline banner blocks content or obscures FAB | 1 | 1 | 1 | E2E viewport assert banner non-blocking |

### Risk Category Legend

- **TECH**: Technical/Architecture
- **SEC**: Security
- **PERF**: Performance
- **DATA**: Data Integrity
- **BUS**: Business Impact (UX harm)
- **OPS**: Operations

---

## Entry Criteria

- [ ] Epic 5 stories created and ACs finalized
- [ ] Test environment with network control (throttling / offline simulation)
- [ ] Playwright configured for route interception (fail/abort)
- [ ] Backend error paths instrumented (Story 5.4)

## Exit Criteria

- [ ] All P0 tests passing
- [ ] All P1 tests passing (or failures triaged)
- [ ] No open high-priority bugs for Epic 5 scope
- [ ] Coverage ≥80% on retry logic, toast, offline queue

---

## Test Coverage Plan

**Note:** P0/P1/P2/P3 = priority/risk classification, NOT execution timing. See Execution Strategy for when tests run.

### P0 (Critical)

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
|-------------|------------|-----------|------------|-------|-------|
| 5.1 Retry on fail + rollback on final failure | Unit + E2E | R-003 | 2 | Dev | Mock fetch fail; assert rollback |
| 5.2 Error toast on final failure + Retry button | E2E | R-002 | 2 | QA | Route intercept 500; assert toast + retry |
| 5.3 Offline create → persists → syncs on reconnect | E2E | R-001 | 3 | QA | navigator.onLine mock or route abort |
| 5.4 Backend 500/504 no sensitive data in response | Integration | R-004 | 2 | Dev | Force DB error; assert generic message |

**Total P0**: 10 tests

### P1 (High)

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
|-------------|------------|-----------|------------|-------|-------|
| 5.1 Retry backoff timing (1s, 2s, 4s) | Unit | R-003 | 2 | Dev | Mock clock |
| 5.1 Success on 2nd retry → no toast | E2E | R-002 | 1 | QA | Intercept fail then succeed |
| 5.2 Toast messages per operation type | Component | - | 3 | Dev | create/complete/delete error copy |
| 5.2 Manual Retry re-runs mutation | E2E | R-002 | 2 | QA | Click Retry, assert retry |
| 5.3 Offline banner visible, non-blocking | E2E | R-006 | 2 | QA | Assert banner + FAB visible |
| 5.3 Queued completion syncs on reconnect | E2E | R-001 | 1 | QA | Offline complete → online |
| 5.4 400 malformed request logged, no stack | Integration | R-004 | 2 | Dev | Invalid JSON, assert 400 + log |
| 5.4 Request ID in 500 response and logs | Integration | - | 1 | Dev | Correlation |

**Total P1**: 18 tests

### P2 (Medium)

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
|-------------|------------|-----------|------------|-------|-------|
| 5.1 GET retry + cached data during retries | Unit | - | 2 | Dev | Query retry, cache stays |
| 5.2 Multiple toasts stack (max 3) | Component | R-005 | 2 | Dev | Trigger 4 fails, assert 3 visible |
| 5.3 Extended offline (5+ min) + refresh | E2E | R-001 | 2 | QA | Only if IndexedDB implemented |
| 5.4 Timeout 504 + connection cleanup | Integration | - | 1 | Dev | Long-running route |

**Total P2**: 7 tests

### P3 (Low)

| Requirement | Test Level | Test Count | Owner | Notes |
|-------------|------------|------------|-------|-------|
| 5.2 No retry button when navigator.onLine false | E2E | 1 | QA | Offline + fail |
| 5.3 Failed sync after reconnect → toast + queue retained | E2E | 1 | QA | Complex flow |
| Rapid multi-mutation independence | E2E | 2 | QA | Create 3, complete 2, flaky network |

**Total P3**: 4 tests

---

## Execution Strategy

**Philosophy:** Run all functional tests in PRs if total runtime &lt;15 min. Defer to nightly only when expensive (offline simulation, long timeout tests).

| Timing | Scope | Duration |
|--------|-------|----------|
| **Every PR** | All Playwright E2E + Vitest unit/integration | ~12–18 min |
| **Nightly** | Offline simulation, 5+ min persistence, timeout tests | ~30 min |

---

## Resource Estimates

| Priority | Count | Effort (Interval) | Notes |
|----------|-------|-------------------|-------|
| P0 | 10 | ~15–25 hours | Route intercept, offline simulation |
| P1 | 18 | ~15–22 hours | Component + E2E |
| P2 | 7 | ~5–8 hours | Edge cases |
| P3 | 4 | ~3–6 hours | Exploratory |
| **Total** | **39** | **~38–60 hours (~1–1.5 weeks)** | Includes setup |

---

## Quality Gate Criteria

- **P0 pass rate**: 100%
- **P1 pass rate**: ≥95%
- **P2/P3 pass rate**: ≥90%
- **Coverage**: ≥80% on retry, toast, offline queue code
- **R-001**: Offline persistence verified before release

---

## Mitigation Plans

### R-001: Offline-created tasks lost (Score: 6)

**Mitigation:** Implement persistence per Story 5.3 (TanStack Query cache or IndexedDB). Add E2E: create offline → refresh → verify task still present after reconnect. Unit test persistence layer.

**Verification:** E2E "offline create persists across refresh" passes.

---

## Assumptions and Dependencies

### Assumptions

1. Story 5.3 specifies TanStack Query cache or IndexedDB for offline persistence
2. Route interception (Playwright `route.abort`, `route.fulfill`) sufficient for offline/fail simulation
3. Backend Story 5.4 merged before full E2E; integration tests can run against staged errors

### Dependencies

1. Playwright route API for network failure simulation
2. Backend error handler returning generic messages (Story 5.4)

---

## Interworking & Regression

| Service/Component | Impact | Regression Scope |
|------------------|--------|-------------------|
| HomePage / useMutation hooks | Retry, toast, offline | Existing task-workflow, task-lifecycle E2E |
| TanStack Query | Retry config, cache | Existing optimistic UI unit tests |
| Backend routes | Error responses | Existing integration tests |
| ErrorBoundary / Axios interceptor | Toast display | New component tests |

---

## Appendix

### Related Documents

- Epic: `_bmad-output/planning-artifacts/epics.md` (Epic 5)
- Architecture: `_bmad-output/planning-artifacts/technical-architecture-aine-bmad-test-2026-02-17.md`

---

**Generated by:** BMad TEA Agent - Test Architect Module  
**Workflow:** `_bmad/tea/testarch/test-design`  
**Version:** 5.0
