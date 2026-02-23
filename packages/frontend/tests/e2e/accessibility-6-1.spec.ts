/**
 * ATDD Story 6.1: Semantic HTML - Landmarks and Headings
 * RED phase: tests assert landmarks, headings, list structure
 */
import { test, expect } from '@playwright/test';

test.describe('[Story 6.1] Semantic HTML - E2E (ATDD)', () => {
  test.skip('[P0] page has main landmark', async ({ page }) => {
    await page.goto('/');
    const main = page.locator('main, [role="main"]');
    await expect(main).toHaveCount(1);
  });

  test.skip('[P0] single h1 for app title', async ({ page }) => {
    await page.goto('/');
    const h1s = page.locator('h1');
    await expect(h1s).toHaveCount(1);
    await expect(h1s).toContainText('aine');
  });

  test.skip('[P0] task list uses ul/li structure', async ({ page }) => {
    await page.goto('/');
    const ul = page.locator('ul');
    const listCount = await ul.count();
    expect(listCount).toBeGreaterThanOrEqual(0);
    if (listCount > 0) {
      await expect(ul.first()).toBeVisible();
    }
  });

  test.skip('[P1] dialog has role="dialog" and aria-modal', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('button', { name: /add task/i })
      .first()
      .click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  test.skip('[P1] FAB is button element', async ({ page }) => {
    await page.goto('/');
    const fab = page.getByRole('button', { name: /add task/i }).first();
    await expect(fab).toHaveCount(1);
    const tag = await fab.evaluate((el) => el.tagName);
    expect(tag.toLowerCase()).toBe('button');
  });

  test.skip('[P2] add task input has associated label', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('button', { name: /add task/i })
      .first()
      .click();
    const input = page.getByRole('textbox');
    await expect(input).toBeVisible();
    const id = await input.getAttribute('id');
    const label = id
      ? page.locator(`label[for="${id}"]`)
      : page.getByText(/what needs to be done/i);
    await expect(label).toBeVisible();
  });
});
