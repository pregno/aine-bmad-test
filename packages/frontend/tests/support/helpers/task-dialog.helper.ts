import type { Page } from '@playwright/test';

/**
 * Create a task via the add-task dialog.
 */
export async function createTaskViaDialog(page: Page, text: string): Promise<void> {
  await page
    .getByRole('button', { name: /add task/i })
    .first()
    .click();
  await page.getByRole('textbox').fill(text);
  await page.getByTestId('add-task-submit').click();
}
