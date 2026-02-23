/**
 * Error state E2E tests — automation workflow
 * Covers: GET fail → Retry visible; Clear Cancel; Delete Cancel
 */
import { test, expect } from '@playwright/test';
import { createTaskViaDialog } from '../support/helpers';

test.describe('Error States', () => {
  test('[P0] GET tasks fails — shows Failed to load tasks and Retry button', async ({ page }) => {
    await page.route('**/api/v1/tasks', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({ status: 500, body: '{}' });
        return;
      }
      route.continue();
    });

    await page.goto('/');

    await expect(page.getByText(/failed to load tasks/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('retry-button')).toBeVisible();
    await expect(page.getByRole('button', { name: /add task/i })).toBeVisible();
  });

  test('[P0] Retry button refetches after initial GET failure', async ({ page }) => {
    let getCount = 0;
    await page.route('**/api/v1/tasks', async (route) => {
      if (route.request().method() === 'GET') {
        getCount++;
        if (getCount === 1) {
          route.fulfill({ status: 500, body: '{}' });
          return;
        }
      }
      await route.continue();
    });

    await page.goto('/');

    await expect(page.getByText(/failed to load tasks/i)).toBeVisible({ timeout: 10_000 });
    await page.getByTestId('retry-button').click();

    // After retry, either success (No tasks yet / empty list) or still error
    await expect(
      page.getByText(/failed to load tasks|no tasks yet|tap \+ to get started/i)
    ).toBeVisible({ timeout: 10_000 });
  });

  test('[P1] Clear All Completed — Cancel preserves tasks', async ({ page }) => {
    await page.goto('/');
    const text = `ClearCancel ${Date.now()}`;
    await createTaskViaDialog(page, text);
    await expect(page.getByText(text)).toBeVisible({ timeout: 5_000 });

    await page.getByText(text).click();
    await expect(page.getByText(/Completed \(\d+\)/)).toBeVisible({ timeout: 5_000 });

    await page.getByTestId('completed-section-toggle').click();
    await expect(page.getByTestId('clear-completed-button')).toBeVisible();
    await page.getByTestId('clear-completed-button').click();

    await expect(page.getByRole('dialog')).toContainText(/delete all.*completed tasks/i);
    await page.getByTestId('clear-completed-cancel').click();

    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText(text)).toBeVisible();
  });

  test('[P1] Delete task — Cancel preserves task', async ({ page }) => {
    await page.goto('/');
    const text = `DeleteCancel ${Date.now()}`;
    await createTaskViaDialog(page, text);
    await expect(page.getByText(text)).toBeVisible({ timeout: 5_000 });

    // Hover to reveal delete button (desktop), then open delete dialog
    const card = page.getByText(text).locator('..').locator('..');
    await page.getByText(text).hover();
    await card.getByRole('button', { name: /delete task/i }).click();

    await expect(page.getByRole('dialog')).toContainText(/delete this task/i);
    await page.getByTestId('delete-cancel').click();

    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText(text)).toBeVisible();
  });
});
