# E2E Tests

Playwright E2E tests for the aine task management app.

## Setup

```bash
# From project root
pnpm install

# Start services (Docker) before E2E
docker compose --profile local up -d --wait
```

## Running Tests

```bash
# From project root (starts Docker, runs E2E, tears down)
pnpm test:e2e

# From packages/frontend (requires services already running)
pnpm --filter @aine/frontend test:e2e

# Specific test file
pnpm --filter @aine/frontend test:e2e -- task-workflow

# Headed mode (see browser)
pnpm --filter @aine/frontend test:e2e -- --headed

# Debug
pnpm --filter @aine/frontend test:e2e -- --debug
```

## Architecture

### Directory Structure

```
tests/
├── e2e/           # E2E specs (*.spec.ts)
├── support/
│   ├── fixtures/  # Base fixtures, extend with test.extend()
│   ├── helpers/   # API and UI helpers (api.helper, task-dialog.helper)
│   └── factories/ # Data factories (task.factory)
└── README.md      # This file
```

### Fixtures

Base fixture exports from `support/fixtures/index.ts`:

```ts
import { test, expect } from '../support/fixtures';
```

Extend for custom fixtures (e.g. seeded tasks, auth):

```ts
import { test as base } from '@playwright/test';
const test = base.extend({ ... });
```

### Factories

```ts
import { createTask, createTasks } from '../support/factories';

const task = createTask({ text: 'My task' });
const tasks = createTasks(5, [{ text: 'First' }, { text: 'Second' }]);
```

### Helpers

```ts
import { createTaskViaDialog, fetchTasks, deleteTask } from '../support/helpers';
```

## Best Practices

- **Selectors**: Prefer `data-testid` and `getByRole`; avoid brittle class selectors
- **Isolation**: Use unique data (factories with timestamp) to avoid cross-test collisions
- **Cleanup**: Tests may leave tasks; use unique text or API cleanup in `test.afterEach` if needed
- **Timeouts**: Default 60s per test; 15s for actions, 30s for navigation

## CI Integration

- JUnit output: `test-results/junit.xml` (when `CI` env set)
- HTML report: `playwright-report/`
- Retries: 2 in CI; 0 locally

## Knowledge Base

- `_bmad/tea/testarch/knowledge/fixture-architecture.md`
- `_bmad/tea/testarch/knowledge/data-factories.md`
- `_bmad/tea/testarch/knowledge/selector-resilience.md`
