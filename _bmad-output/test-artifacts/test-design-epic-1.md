# Test Design: Epic 1 - Development Environment & Infrastructure Setup

**Date:** 2026-02-20  
**Author:** Pregno  
**Status:** Complete (Epic Done) — Reference / Retrospective  

---

## Executive Summary

**Scope:** Test design for Epic 1 (Development Environment & Infrastructure Setup)

**Note:** Epic 1 is **done** per sprint-status. This document serves as a reference test plan for infrastructure validation, onboarding verification, and regression when environment config changes.

**Risk Summary:**

- Total risks identified: 5
- High-priority risks (≥6): 0 (Epic complete; risks were pre-implementation)
- Critical categories: OPS, TECH

**Coverage Summary:**

- P0 scenarios: 8 (~10–16 hours — mostly manual/smoke)
- P1 scenarios: 10 (~8–12 hours)
- P2/P3 scenarios: 6 (~4–8 hours)
- **Total effort**: ~22–36 hours

---

## Not in Scope

| Item | Reasoning | Mitigation |
|------|----------|------------|
| Epic 2–6 features | Different epics | Covered by respective test designs |
| Production deployment | Out of Epic 1 scope | Separate deployment verification |
| Third-party service SLAs | Vendor-managed | Docker Hub, npm registry assumed available |

---

## Risk Assessment (Retrospective)

### Medium-Priority Risks (Score 3–4)

| Risk ID | Category | Description | P | I | Score | Mitigation | Owner |
|---------|----------|-------------|---|---|-------|------------|-------|
| R-001 | OPS | Docker profile misconfig → services fail to start | 2 | 2 | 4 | Smoke: `docker compose --profile local up -d`; CI runs test profile | Dev |
| R-002 | TECH | Shared types drift between frontend/backend | 1 | 3 | 3 | Root `pnpm type-check`; CI enforces | Dev |
| R-003 | OPS | Testcontainers flakiness in CI | 2 | 1 | 2 | Retries; stable PostgreSQL image | Dev |

### Low-Priority Risks (Score 1–2)

| Risk ID | Category | Description | P | I | Score | Action |
|---------|----------|-------------|---|---|-------|--------|
| R-004 | OPS | Coverage thresholds not met | 1 | 2 | 2 | `pnpm test:coverage` in CI |
| R-005 | TECH | Hot reload breaks in edge cases | 1 | 1 | 1 | Manual verification; tsx watch stable |

### Risk Category Legend

- **TECH**: Technical/Architecture
- **SEC**: Security
- **PERF**: Performance
- **DATA**: Data Integrity
- **BUS**: Business Impact
- **OPS**: Operations

---

## Entry Criteria (Historical)

- [x] PRD and architecture docs available
- [x] Repository initialized

## Exit Criteria (Met)

- [x] All Epic 1 stories done
- [x] `pnpm install`, `pnpm dev`, `pnpm test`, `pnpm test:e2e` work
- [x] Docker profiles (local, test, prod) operational
- [x] Coverage thresholds enforced

---

## Test Coverage Plan

**Note:** Epic 1 is infrastructure; many validations are smoke/CI checks rather than automated test specs.

### P0 (Critical — Smoke / CI)

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
|-------------|------------|-----------|------------|-------|-------|
| 1.1 pnpm install + type-check pass | CI | R-002 | 1 | Dev | `pnpm install && pnpm type-check` |
| 1.2 Docker local profile starts | Smoke | R-001 | 1 | Dev | `docker compose --profile local up -d --wait` |
| 1.3 Backend health + CORS | Integration | - | 1 | Dev | GET /health 200 |
| 1.4 Frontend dev server + MUI | E2E | - | 1 | QA | smoke.spec.ts homepage |
| 1.5 Vitest, Testcontainers, Playwright run | CI | R-003 | 3 | Dev | `pnpm test`, `pnpm test:e2e` |

**Total P0**: 8 tests

### P1 (High)

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
|-------------|------------|-----------|------------|-------|-------|
| 1.2 Docker test profile (isolated DB) | Smoke | R-001 | 1 | Dev | test profile, different ports |
| 1.2 Named volume persistence | Smoke | - | 1 | Dev | down/up retains data |
| 1.3 Prisma migrate + schema | Integration | - | 1 | Dev | migrate dev, schema matches |
| 1.4 HMR (optional) | Manual | R-005 | 1 | Dev | Edit component, verify hot reload |
| 1.5 Coverage threshold 80% | CI | R-004 | 1 | Dev | `pnpm test:coverage` |
| 1.5 E2E Desktop + Mobile Chrome | E2E | - | 2 | QA | Playwright projects |

**Total P1**: 10 tests

### P2/P3 (Medium / Low)

| Requirement | Test Level | Test Count | Owner | Notes |
|-------------|------------|------------|-------|-------|
| 1.2 Docker prod profile | Smoke | 1 | Dev | No bind mounts, restart policy |
| 1.1 Shared type change propagates | Manual | 1 | Dev | Edit shared type, both packages see it |
| 1.3 Pino log format (dev vs prod) | Manual | 1 | Dev | Env switch |

**Total P2/P3**: 6 tests

---

## Execution Strategy

| Timing | Scope | Duration |
|--------|-------|----------|
| **Every PR** | `pnpm install`, `pnpm type-check`, `pnpm test`, `pnpm lint` | ~5–10 min |
| **CI** | Full test suite including E2E (with Docker) | ~15–20 min |
| **Manual** | Docker profile smoke, HMR spot-check | On environment changes |

---

## Resource Estimates

| Priority | Count | Effort (Interval) | Notes |
|----------|-------|-------------------|-------|
| P0 | 8 | ~10–16 hours | Most already implemented |
| P1 | 10 | ~8–12 hours | CI + smoke |
| P2/P3 | 6 | ~4–8 hours | Manual / edge |
| **Total** | **24** | **~22–36 hours** | Epic complete; estimates retrospective |

---

## Quality Gate Criteria

- **P0 pass rate**: 100%
- **P1 pass rate**: ≥95%
- **Coverage**: ≥80% (NFR5)
- **Docker**: All profiles start without error

---

## Interworking & Regression

| Service/Component | Impact | Regression Scope |
|-------------------|--------|-------------------|
| pnpm workspace | Type sharing | Any change to shared types |
| Docker Compose | All services | E2E, integration tests |
| Vitest / Playwright | All tests | Entire test suite |

---

## Appendix

### Related Documents

- Epic: `_bmad-output/planning-artifacts/epics.md` (Epic 1)
- Architecture: `_bmad-output/planning-artifacts/technical-architecture-aine-bmad-test-2026-02-17.md`
- Retro: `_bmad-output/implementation-artifacts/epic-1-retro-2026-02-18.md`

---

**Generated by:** BMad TEA Agent - Test Architect Module  
**Workflow:** `_bmad/tea/testarch/test-design`  
**Version:** 5.0
