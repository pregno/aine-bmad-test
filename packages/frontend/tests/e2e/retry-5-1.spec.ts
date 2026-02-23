/**
 * ATDD Story 5.1: TanStack Query Retry Logic - Exponential Backoff
 * RED phase: tests assert retry behavior via route interception
 */
import { test, expect } from '@playwright/test';
import { createTaskViaDialog } from '../support/helpers';

test.describe('[Story 5.1] Retry Logic - E2E (ATDD)', () => {
  test.skip('[P0] create fails once then succeeds on retry - no toast', async ({
    page,
    request,
  }) => {
    let attempt = 0;
    await page.route('**/api/v1/tasks', async (route) => {
      if (route.request().method() === 'POST') {
        attempt++;
        if (attempt === 1) {
          await route.abort('failed');
          return;
        }
      }
      await route.continue();
    });

    await page.goto('/');
    const text = `Retry success ${Date.now()}`;
    await createTaskViaDialog(page, text);

    await expect(page.getByText(text)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/failed to create|try again/i)).not.toBeVisible();
  });

  test.skip('[P0] create fails 3 times - task removed, error toast shown', async ({ page }) => {
    await page.route('**/api/v1/tasks', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 500, body: '{}' });
        return;
      }
      route.continue();
    });

    await page.goto('/');
    const text = `Fail 3x ${Date.now()}`;
    await createTaskViaDialog(page, text);

    // After retries exhausted: task rolled back, toast visible
    await expect(page.getByText(text)).not.toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/failed to create|try again/i)).toBeVisible({ timeout: 5_000 });
  });

  test.skip('[P1] GET fail - cached data stays, no empty flash', async ({ page, request }) => {
    await page.goto('/');
    const text = `Cached task ${Date.now()}`;
    await createTaskViaDialog(page, text);
    await expect(page.getByText(text)).toBeVisible({ timeout: 5_000 });

    let getCount = 0;
    await page.route('**/api/v1/tasks', async (route) => {
      if (route.request().method() === 'GET') {
        getCount++;
        if (getCount <= 2) {
          await route.abort('failed');
          return;
        }
      }
      await route.continue();
    });

    await page.reload();
    await expect(page.getByText(text)).toBeVisible({ timeout: 10_000 });
  });
});
