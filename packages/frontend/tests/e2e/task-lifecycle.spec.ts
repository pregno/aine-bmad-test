import { test, expect } from '@playwright/test';
import { createTaskViaDialog } from '../support/helpers';

test.describe('Task Lifecycle - Complete & Clear', () => {
  test('completing a task moves it to completed section', async ({ page }) => {
    await page.goto('/');
    const taskText = `Complete-me ${Date.now()}`;

    await createTaskViaDialog(page, taskText);
    await expect(page.getByText(taskText)).toBeVisible({ timeout: 5_000 });

    await page.getByText(taskText).click();
    await expect(page.getByText(/Completed \(\d+\)/)).toBeVisible({ timeout: 5_000 });

    await page.getByTestId('completed-section-toggle').click();
    await expect(page.getByText(taskText)).toBeVisible();
  });

  test('expand completed section shows Clear All Completed button', async ({ page }) => {
    await page.goto('/');
    const taskText = `Expand-clear ${Date.now()}`;

    await createTaskViaDialog(page, taskText);
    await expect(page.getByText(taskText)).toBeVisible({ timeout: 5_000 });

    await page.getByText(taskText).click();
    await expect(page.getByText(/Completed \(\d+\)/)).toBeVisible({ timeout: 5_000 });

    await page.getByTestId('completed-section-toggle').click();
    await expect(page.getByTestId('clear-completed-button')).toBeVisible();
    await expect(page.getByText('Clear All Completed')).toBeVisible();
  });

  test('clearing all completed removes tasks and shows success toast', async ({ page }) => {
    await page.goto('/');
    const task1 = `Clear-A ${Date.now()}`;
    const task2 = `Clear-B ${Date.now() + 1}`;

    await createTaskViaDialog(page, task1);
    await expect(page.getByText(task1)).toBeVisible({ timeout: 5_000 });
    await page.getByText(task1).click();

    await createTaskViaDialog(page, task2);
    await expect(page.getByText(task2)).toBeVisible({ timeout: 5_000 });
    await page.getByText(task2).click();

    await expect(page.getByText(/Completed \(\d+\)/)).toBeVisible({ timeout: 5_000 });
    await page.getByTestId('completed-section-toggle').click();
    await expect(page.getByText(task1)).toBeVisible();
    await expect(page.getByText(task2)).toBeVisible();

    await page.getByTestId('clear-completed-button').click();
    await expect(page.getByRole('dialog')).toContainText(/delete all \d+ completed tasks/i);
    await page.getByTestId('clear-completed-confirm').click();

    await expect(page.getByText(/\d+ tasks cleared/)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(task1)).not.toBeVisible();
    await expect(page.getByText(task2)).not.toBeVisible();
  });
});
