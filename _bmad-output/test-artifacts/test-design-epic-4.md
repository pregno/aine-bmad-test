# Test Design: Epic 4 - Mobile-First User Experience & Visual Design

**Date:** 2026-02-20  
**Author:** Pregno  
**Status:** Draft  

---

## Executive Summary

**Scope:** Full test design for Epic 4 (Mobile-First User Experience & Visual Design)

**Risk Summary:**

- Total risks identified: 6
- High-priority risks (≥6): 1
- Critical categories: BUS, PERF

**Coverage Summary:**

- P0 scenarios: 8 (~12–20 hours)
- P1 scenarios: 15 (~12–18 hours)
- P2/P3 scenarios: 12 (~6–12 hours)
- **Total effort**: ~30–50 hours (~1–1.5 weeks)

---

## Not in Scope

| Item | Reasoning | Mitigation |
|------|----------|------------|
| Epic 5 (Network Resilience) | Not yet implemented | Covered when epic starts |
| Epic 6 (Accessibility) | Not yet implemented | WCAG tests when epic starts |
| Visual regression (pixel-perfect) | Out of scope for MVP | Manual QA for theme changes |
| Third-party MUI components | Vendor-tested | Rely on MUI test suite |

---

## Risk Assessment

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | P | I | Score | Mitigation | Owner | Timeline |
|---------|----------|-------------|---|---|-------|------------|-------|----------|
| R-001 | BUS | Mobile breakpoint bugs cause unusable UI on target devices (iOS Safari, Android Chrome) | 2 | 3 | 6 | E2E in Mobile Chrome viewport; manual smoke on real devices | QA | Pre-release |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description | P | I | Score | Mitigation | Owner |
|---------|----------|-------------|---|---|-------|------------|-------|
| R-002 | PERF | Micro-animations cause jank on low-end devices | 2 | 2 | 4 | Performance trace in E2E; prefers-reduced-motion testing | Dev |
| R-003 | TECH | Date grouping logic errors (Today/Yesterday/This Week/Older) | 2 | 2 | 4 | Unit tests for formatRelativeTime; E2E for date display | Dev |
| R-004 | BUS | Typography hierarchy not applied correctly (bold today, faded older) | 1 | 3 | 3 | Component tests for opacity/weight; visual assertions | Dev |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description | P | I | Score | Action |
|---------|----------|-------------|---|---|-------|--------|
| R-005 | OPS | Theme tokens drift from spec (#2196F3, Roboto, 8px spacing) | 1 | 2 | 2 | Unit test muiTheme; manual spot-check |
| R-006 | BUS | Loading spinner blocks when it should not (optimistic UI regression) | 1 | 1 | 1 | Existing E2E; add explicit "no spinner on create" assertion |

### Risk Category Legend

- **TECH**: Technical/Architecture
- **SEC**: Security
- **PERF**: Performance
- **DATA**: Data Integrity
- **BUS**: Business Impact (UX harm)
- **OPS**: Operations

---

## Entry Criteria

- [ ] Epic 4 stories created and ACs finalized
- [ ] Test environment provisioned (Docker local profile or CI)
- [ ] Playwright configured for Desktop + Mobile Chrome viewports
- [ ] MUI theme changes merged to test branch

## Exit Criteria

- [ ] All P0 tests passing
- [ ] All P1 tests passing (or failures triaged)
- [ ] No open high-priority bugs for Epic 4 scope
- [ ] Coverage ≥80% on new theme/format utilities

---

## Test Coverage Plan

**Note:** P0/P1/P2/P3 = priority/risk classification, NOT execution timing. See Execution Strategy for when tests run.

### P0 (Critical)

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
|-------------|------------|-----------|------------|-------|-------|
| 4.1 MUI theme (primary #2196F3, Roboto) | Component | R-005 | 2 | Dev | muiTheme.test.ts |
| 4.2 Responsive layout (mobile/tablet/desktop) | E2E | R-001 | 3 | QA | Resize viewport, assert layout |
| 4.3 Date grouping (Today, Yesterday, This Week, Older) | Unit + E2E | R-003 | 2 | Dev | formatRelativeTime + E2E |
| 4.6 Loading spinner (initial only, no spinner on optimistic ops) | E2E | R-006 | 1 | QA | Existing + explicit no-spinner on create |

**Total P0**: 8 tests

### P1 (High)

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
|-------------|------------|-----------|------------|-------|-------|
| 4.2 Breakpoint transitions (600px, 900px) | E2E | R-001 | 2 | QA | Resize asserts |
| 4.3 Empty date groups hidden | Unit | R-003 | 2 | Dev | Grouping logic |
| 4.4 Typography hierarchy (bold today, faded older) | Component | R-004 | 3 | Dev | Opacity/weight assertions |
| 4.5 Micro-animations (slide-in, slide-out, staggered clear) | E2E | R-002 | 4 | QA | Animation presence; prefers-reduced-motion |
| 4.6 Error state (Failed to load, Retry button) | E2E | - | 2 | QA | Existing coverage |

**Total P1**: 15 tests

### P2 (Medium)

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
|-------------|------------|-----------|------------|-------|-------|
| 4.1 Spacing tokens, border radius | Unit | R-005 | 2 | Dev | Theme object asserts |
| 4.3 Timestamp format per group | Unit | R-003 | 4 | Dev | formatRelativeTime edge cases |
| 4.5 Animation overlap (no jank) | E2E | R-002 | 2 | QA | Performance trace optional |
| 4.6 Slow 3G (spinner persists) | E2E | - | 1 | QA | Network throttle |

**Total P2**: 9 tests

### P3 (Low)

| Requirement | Test Level | Test Count | Owner | Notes |
|-------------|------------|------------|-------|-------|
| 4.1 Color contrast (WCAG) | Manual | 1 | QA | Axe/WAVE audit |
| 4.5 60fps assertion | E2E | 1 | QA | Performance trace |

**Total P3**: 2 tests

---

## Execution Strategy

**Philosophy:** Run all functional tests in PRs if total runtime &lt;15 min (Playwright parallelization). Defer to nightly/weekly only when expensive (performance traces, chaos, long-running).

| Timing | Scope | Duration |
|--------|-------|----------|
| **Every PR** | All Playwright E2E + Vitest unit/component tests | ~10–15 min |
| **Nightly** | Performance traces, Slow 3G throttling, prefers-reduced-motion | ~30 min |
| **Weekly** | Manual contrast audit (WCAG), real-device smoke on iOS/Android | On-demand |

---

## Resource Estimates

| Priority | Count | Effort (Interval) | Notes |
|----------|-------|-------------------|-------|
| P0 | 8 | ~12–20 hours | E2E viewport setup, component theme |
| P1 | 15 | ~12–18 hours | Standard coverage, animations |
| P2 | 9 | ~6–10 hours | Unit edge cases, light E2E |
| P3 | 2 | ~2–4 hours | Exploratory, manual audit |
| **Total** | **34** | **~30–50 hours (~1–1.5 weeks)** | Includes setup and complexity |

### Prerequisites

**Test Data:** Task fixtures via API (create, complete)

**Tooling:** Playwright (Desktop Chrome, Mobile Chrome), Vitest, RTL

**Environment:** Docker Compose local profile or CI runners

---

## Quality Gate Criteria

- **P0 pass rate**: 100%
- **P1 pass rate**: ≥95%
- **P2/P3 pass rate**: ≥90%
- **Coverage**: ≥80% on new theme/format code
- **R-001**: Mobile viewport E2E passing before release

---

## Mitigation Plans

### R-001: Mobile breakpoint bugs (Score: 6)

**Mitigation:** Playwright Mobile Chrome viewport (Pixel 5); add viewport-specific E2E for 375px, 600px, 900px. Manual smoke on real iOS/Android before release.

**Verification:** E2E suite includes Mobile Chrome project; no layout overflow or tap-target failures.

---

## Assumptions and Dependencies

### Assumptions

1. Epic 4 stories (4-1 through 4-6) will be implemented in order
2. MUI theme utilities are testable via theme provider in unit tests
3. Date grouping uses local timezone; tests use fixed dates where needed

### Dependencies

1. Story 4-1 (theme) merged before 4-2 (layout) — enables theme assertions
2. Playwright already configured with Mobile Chrome project

---

## Interworking & Regression

| Service/Component | Impact | Regression Scope |
|-------------------|--------|------------------|
| HomePage | Theme, layout, date grouping | Existing task-workflow, task-lifecycle E2E |
| TaskCard / SwipeableTaskCard | Animation, typography | Existing HomePage unit tests |
| formatRelativeTime | Date display | Existing formatRelativeTime.test.ts |
| Backend API | Unchanged | Existing integration tests |

---

## Appendix

### Related Documents

- Epic: `_bmad-output/planning-artifacts/epics.md` (Epic 4)
- Architecture: `_bmad-output/planning-artifacts/technical-architecture-aine-bmad-test-2026-02-17.md`
- UX Spec: `_bmad-output/planning-artifacts/ux-design-specification.md`

---

**Generated by:** BMad TEA Agent - Test Architect Module  
**Workflow:** `_bmad/tea/testarch/test-design`  
**Version:** 5.0
