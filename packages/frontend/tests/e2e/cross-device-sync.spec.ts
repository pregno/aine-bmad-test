import { test, expect } from '@playwright/test';

test.describe('cross-device sync', () => {
  test('task created on phone appears on desktop within sync window (AC1)', async ({ browser }) => {
    const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 } });

    const desktopPage = await desktopContext.newPage();
    const mobilePage = await mobileContext.newPage();

    await desktopPage.goto('/');
    await mobilePage.goto('/');

    await expect(desktopPage.locator('h1')).toContainText('aine');
    await expect(mobilePage.locator('h1')).toContainText('aine');

    const taskText = `Cross-device task ${Date.now()}`;

    await mobilePage
      .getByRole('button', { name: /add task/i })
      .first()
      .click();
    await mobilePage.getByRole('textbox').fill(taskText);
    await mobilePage.getByTestId('add-task-submit').click();

    // Task is visible on mobile immediately via optimistic UI (Story 2.5).
    await expect(mobilePage.getByText(taskText)).toBeVisible({ timeout: 3_000 });

    // Desktop loads fresh page to simulate cross-device fetch from single source of truth.
    await desktopPage.reload();
    await expect(desktopPage.getByText(taskText)).toBeVisible({ timeout: 10_000 });

    await desktopContext.close();
    await mobileContext.close();
  });

  test('task fields are identical across both device contexts for data parity (AC4)', async ({
    browser,
  }) => {
    const context1 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const context2 = await browser.newContext({ viewport: { width: 375, height: 812 } });

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    await page1.goto('/');
    await page2.goto('/');

    const taskText = `Parity task ${Date.now()}`;

    await page1
      .getByRole('button', { name: /add task/i })
      .first()
      .click();
    await page1.getByRole('textbox').fill(taskText);
    await page1.getByTestId('add-task-submit').click();
    await expect(page1.getByText(taskText)).toBeVisible({ timeout: 5_000 });

    await page1.waitForFunction(
      () => {
        const el = document.querySelector('[data-taskid]');
        const id = el?.getAttribute('data-taskid') ?? '';
        return !id.startsWith('temp-');
      },
      { timeout: 5_000 }
    );

    const taskId1 = await page1.locator('[data-taskid]').first().getAttribute('data-taskid');
    expect(taskId1).toBeTruthy();

    await page2.reload();
    await expect(page2.getByText(taskText)).toBeVisible({ timeout: 10_000 });

    const taskId2 = await page2.locator('[data-taskid]').first().getAttribute('data-taskid');
    expect(taskId2).toBe(taskId1);

    await context1.close();
    await context2.close();
  });

  test('fresh device context loads all previously persisted tasks (AC5)', async ({ browser }) => {
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();

    await page1.goto('/');

    const taskText = `Fresh device task ${Date.now()}`;

    await page1
      .getByRole('button', { name: /add task/i })
      .first()
      .click();
    await page1.getByRole('textbox').fill(taskText);
    await page1.getByTestId('add-task-submit').click();
    await expect(page1.getByText(taskText)).toBeVisible({ timeout: 5_000 });

    await context1.close();

    // Simulate a brand-new device (fresh browser context with no prior state).
    const freshContext = await browser.newContext();
    const freshPage = await freshContext.newPage();

    await freshPage.goto('/');
    await expect(freshPage.getByText(taskText)).toBeVisible({ timeout: 10_000 });

    await freshContext.close();
  });
});
