/**
 * ATDD Story 4.1: Material-UI Theme - Calming Blue Accent & Roboto
 * RED phase: tests assert expected theme application; some may fail until theme fully configured
 */
import { test, expect } from '@playwright/test';

test.describe('[Story 4.1] Material-UI Theme - E2E (ATDD)', () => {
  test.skip('[P0] FAB uses primary color #2196F3', async ({ page }) => {
    await page.goto('/');
    const fab = page.getByRole('button', { name: /add|add task|\+/i });
    await expect(fab).toBeVisible();
    const bgColor = await fab.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(bgColor).toMatch(/rgb\(33,\s*150,\s*243\)|#2196F3/i);
  });

  test.skip('[P0] page uses Roboto font family', async ({ page }) => {
    await page.goto('/');
    const body = page.locator('body');
    const fontFamily = await body.evaluate((el) => window.getComputedStyle(el).fontFamily);
    expect(fontFamily).toContain('Roboto');
  });

  test.skip('[P1] task cards have minimum 48px height for touch targets', async ({ page }) => {
    await page.goto('/');
    // Create at least one task to check card height
    const addButton = page.getByRole('button', { name: /add|add task|\+/i });
    await addButton.click();
    await page.getByPlaceholder(/what needs to be done/i).fill('ATDD touch target');
    await page.getByRole('button', { name: /add task/i }).click();
    const card = page.locator('[data-testid="task-card"], [class*="MuiCard"]').first();
    await expect(card).toBeVisible();
    const box = await card.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(48);
  });

  test.skip('[P2] cards use 8px border radius', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('[class*="MuiCard-root"]').first();
    if ((await card.count()) === 0) return; // Skip if no cards
    const borderRadius = await card.evaluate((el) => window.getComputedStyle(el).borderRadius);
    expect(borderRadius).toBe('8px');
  });
});
