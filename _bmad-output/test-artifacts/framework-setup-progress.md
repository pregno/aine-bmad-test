---
stepsCompleted: ['step-01-preflight', 'step-02-select-framework', 'step-03-scaffold-framework', 'step-04-docs-and-scripts', 'step-05-validate-and-summary']
lastStep: 'step-05-validate-and-summary'
lastSaved: '2026-02-20'
---

# Framework Setup Progress

## Step 1: Preflight Checks ✅

### Prerequisites

- ✅ `package.json` exists (root + packages/frontend)
- ⚠️ E2E framework already present: **Playwright** in `packages/frontend/playwright.config.ts`
- ✅ Architecture/stack context available

### Project Context

| Item | Value |
|------|-------|
| **Project type** | pnpm workspace, React 18 + Vite |
| **Frontend** | @aine/frontend (React, MUI, TanStack Query) |
| **Backend** | @aine/backend (Fastify, Prisma) |
| **E2E framework** | Playwright (already configured) |
| **Test location** | `packages/frontend/tests/e2e/` |
| **Existing tests** | smoke, task-workflow, cross-device-sync, task-lifecycle, theme-4-1 |

### Findings

- **Framework**: Playwright is installed and configured in `packages/frontend`
- **Config**: Uses `baseURL`, `testDir: ./tests/e2e`, Desktop + Mobile Chrome projects
- **Gaps**: No `tests/support/` structure; no shared fixtures; no data factories; helpers inline in specs
- **Mode**: Proceeding in **enhancement mode** — add support structure without overwriting existing config

---

## Step 2: Framework Selection ✅

**Decision:** Playwright (already in use)

**Rationale:**
- Config specifies `test_framework: playwright` in tea config
- Project has multi-browser (Desktop + Mobile Chrome), API + UI coverage
- CI parallelism and speed matter for monorepo

---

## Step 3: Scaffold Framework ✅

### Directory Structure

- `packages/frontend/tests/support/fixtures/` — base fixture index
- `packages/frontend/tests/support/helpers/` — api.helper, task-dialog.helper
- `packages/frontend/tests/support/factories/` — task.factory.ts

### Config Enhancements

- Playwright config: added `timeout: 60s`, `actionTimeout: 15s`, `navigationTimeout: 30s`
- Added `BASE_URL` env fallback, `video: on-first-retry`
- JUnit reporter for CI

### Fixtures & Factories

- **task.factory.ts**: `createTask(overrides?)`, `createTasks(count, overrides?)`
- **api.helper.ts**: `fetchTasks`, `deleteTask`, `deleteCompletedTasks`
- **task-dialog.helper.ts**: `createTaskViaDialog(page, text)`
- **fixtures/index.ts**: base test export (extendable)

### Environment

- `.env.e2e.example` created with TEST_ENV, BASE_URL, API_URL

---

## Step 4: Documentation & Scripts ✅

- `packages/frontend/tests/README.md` created: setup, run commands, architecture, best practices
- `test:e2e` script present in root and frontend package.json

---

## Step 5: Validate & Summarize ✅

### Checklist Validation

- Preflight: framework present, enhancement mode applied
- Directory structure: support/fixtures, support/helpers, support/factories created
- Config: timeouts, reporters, BASE_URL env
- Fixtures/factories: task.factory, api.helper, task-dialog.helper, fixtures index
- Docs: tests/README.md
- Scripts: test:e2e present

### Completion Summary

| Artifact | Path |
|----------|------|
| Support fixtures | `packages/frontend/tests/support/fixtures/index.ts` |
| Task factory | `packages/frontend/tests/support/factories/task.factory.ts` |
| API helper | `packages/frontend/tests/support/helpers/api.helper.ts` |
| Task dialog helper | `packages/frontend/tests/support/helpers/task-dialog.helper.ts` |
| Tests README | `packages/frontend/tests/README.md` |
| E2E env example | `.env.e2e.example` |
| Progress log | `_bmad-output/test-artifacts/framework-setup-progress.md` |

### Next Steps

1. Optionally migrate existing specs to use helpers: `import { createTaskViaDialog } from '../support/helpers'`
2. Use factories when creating test data: `createTask({ text: 'my task' })`
3. Run E2E: `pnpm test:e2e` (requires Docker services and `pnpm exec playwright install` if browsers missing)
