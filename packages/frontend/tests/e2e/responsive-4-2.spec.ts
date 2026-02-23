/**
 * ATDD Story 4.2: Responsive Layout - Mobile-First Breakpoints
 * RED phase: tests assert expected layout at viewport sizes
 */
import { test, expect } from '@playwright/test';

test.describe('[Story 4.2] Responsive Layout - E2E (ATDD)', () => {
  test.skip('[P0] mobile viewport (<600px) has full-width content with 16px padding', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const content = page.locator('main, [role="main"], .MuiBox-root').first();
    const box = await content.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(375);
    // 16px horizontal padding each side
    const padding = await content.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return parseInt(s.paddingLeft, 10) + parseInt(s.paddingRight, 10);
    });
    expect(padding).toBe(16);
  });

  test.skip('[P0] tablet viewport (600-900px) has max-width 600px centered', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    const content = page.locator('main, [role="main"], [class*="content"]').first();
    const width = await content.evaluate((el) => el.getBoundingClientRect().width);
    expect(width).toBeLessThanOrEqual(600);
  });

  test.skip('[P0] desktop viewport (>900px) has max-width 600px centered', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const content = page.locator('main, [role="main"]').first();
    const box = await content.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(600);
  });

  test.skip('[P1] FAB positioned bottom-right at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const fab = page.getByRole('button', { name: /add task/i }).first();
    await expect(fab).toBeVisible();
    const box = await fab.boundingBox();
    expect(box?.right).toBeLessThanOrEqual(375);
    expect(box?.bottom).toBeLessThanOrEqual(812);
  });

  test.skip('[P2] layout transitions smoothly when resizing across 600px', async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 800 });
    await page.goto('/');
    await page.setViewportSize({ width: 700, height: 800 });
    // No content jump - task list still visible
    await expect(page.locator('h1')).toContainText('aine');
  });
});
