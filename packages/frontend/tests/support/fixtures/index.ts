import { test as base } from '@playwright/test';

/**
 * Base fixtures for E2E tests.
 * Extend with `test.extend()` for custom fixtures (e.g. authenticated user, seeded data).
 *
 * @example
 * ```ts
 * import { test } from '../support/fixtures';
 *
 * test('my test', async ({ page }) => {
 *   await page.goto('/');
 *   // ...
 * });
 * ```
 */
export const test = base;

export { expect } from '@playwright/test';
