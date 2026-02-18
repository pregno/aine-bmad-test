import { test, expect } from '@playwright/test';

test.describe('smoke tests', () => {
  test('homepage loads and displays app title', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('aine');
  });

  test('about page loads via direct navigation', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h2')).toContainText('About aine');
  });
});
