import { test, expect, type Page } from '@playwright/test';

async function clearTasksViaAPI(baseURL: string) {
  const res = await fetch(`${baseURL.replace('5173', '3000')}/api/v1/tasks`);
  const { tasks } = (await res.json()) as { tasks: { id: string }[] };
  // No delete endpoint yet — we just note that tasks from previous runs may exist.
  // Tests use unique text to avoid collisions.
  return tasks;
}

async function createTaskViaDialog(page: Page, text: string) {
  await page
    .getByRole('button', { name: /add task/i })
    .first()
    .click();
  await page.getByRole('textbox').fill(text);
  await page.getByTestId('add-task-submit').click();
}

test.describe('Task Creation Workflow', () => {
  test('shows app title and FAB on load', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('aine');
    await expect(page.getByRole('button', { name: /add task/i })).toBeVisible();
  });

  test('FAB opens add-task dialog with correct elements', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('button', { name: /add task/i })
      .first()
      .click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('textbox')).toBeVisible();
    await expect(page.getByTestId('add-task-submit')).toBeVisible();
    await expect(page.getByTestId('add-task-cancel')).toBeVisible();
  });

  test('creates a task and it appears in the list', async ({ page }) => {
    await page.goto('/');
    const taskText = `E2E task ${Date.now()}`;

    await createTaskViaDialog(page, taskText);

    await expect(page.getByText(taskText)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('cancel closes dialog without creating task', async ({ page }) => {
    await page.goto('/');
    const taskText = `Should not exist ${Date.now()}`;

    await page
      .getByRole('button', { name: /add task/i })
      .first()
      .click();
    await page.getByRole('textbox').fill(taskText);
    await page.getByTestId('add-task-cancel').click();

    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText(taskText)).not.toBeVisible();
  });

  test('escape closes dialog without creating task', async ({ page }) => {
    await page.goto('/');

    await page
      .getByRole('button', { name: /add task/i })
      .first()
      .click();
    await page.getByRole('textbox').fill('Escape discard');
    await page.keyboard.press('Escape');

    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText('Escape discard')).not.toBeVisible();
  });

  test('enter key submits like the Add Task button', async ({ page }) => {
    await page.goto('/');
    const taskText = `Enter key task ${Date.now()}`;

    await page
      .getByRole('button', { name: /add task/i })
      .first()
      .click();
    await page.getByRole('textbox').fill(taskText);
    await page.keyboard.press('Enter');

    await expect(page.getByText(taskText)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});

test.describe('Validation', () => {
  test('empty text shows validation error', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('button', { name: /add task/i })
      .first()
      .click();
    await page.getByTestId('add-task-submit').click();

    await expect(page.getByText('Task text is required')).toBeVisible();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('text exceeding 500 characters shows validation error', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('button', { name: /add task/i })
      .first()
      .click();

    const longText = 'a'.repeat(501);
    await page.getByRole('textbox').fill(longText);
    await page.getByTestId('add-task-submit').click();

    await expect(page.getByText(/500 characters or less/)).toBeVisible();
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});

test.describe('Task Persistence', () => {
  test('created task persists across page reload', async ({ page }) => {
    await page.goto('/');
    const taskText = `Persist task ${Date.now()}`;

    await createTaskViaDialog(page, taskText);
    await expect(page.getByText(taskText)).toBeVisible({ timeout: 5_000 });

    await page.reload();
    await expect(page.getByText(taskText)).toBeVisible({ timeout: 10_000 });
  });

  test('task displays relative timestamp', async ({ page }) => {
    await page.goto('/');
    const taskText = `Timestamped task ${Date.now()}`;

    await createTaskViaDialog(page, taskText);
    await expect(page.getByText(taskText)).toBeVisible({ timeout: 5_000 });

    const taskCard = page.getByText(taskText).locator('..');
    await expect(taskCard.getByText(/just now|min ago/)).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('about page loads at /about', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h2')).toContainText('About aine');
  });

  test('home page loads at /', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('aine');
  });
});

test.describe('API Contract', () => {
  test('GET /api/v1/tasks returns well-formed response', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/v1/tasks');
    expect(response.status()).toBe(200);

    const body = (await response.json()) as { tasks: Record<string, unknown>[] };
    expect(body).toHaveProperty('tasks');
    expect(Array.isArray(body.tasks)).toBe(true);

    if (body.tasks.length > 0) {
      const task = body.tasks[0]!;
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('text');
      expect(task).toHaveProperty('status');
      expect(task).toHaveProperty('createdAt');
      expect(task).toHaveProperty('completedAt');
    }
  });

  test('POST /api/v1/tasks creates a task and returns 201', async ({ request }) => {
    const text = `API test task ${Date.now()}`;
    const response = await request.post('http://localhost:3000/api/v1/tasks', {
      data: { text },
    });

    expect(response.status()).toBe(201);
    const body = (await response.json()) as {
      task: { id: string; text: string; status: string; createdAt: string; completedAt: null };
    };
    expect(body.task.text).toBe(text);
    expect(body.task.status).toBe('ACTIVE');
    expect(body.task.completedAt).toBeNull();
  });

  test('POST /api/v1/tasks rejects empty text with 400', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/v1/tasks', {
      data: { text: '' },
    });
    expect(response.status()).toBe(400);
  });

  test('POST /api/v1/tasks rejects text over 500 chars with 400', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/v1/tasks', {
      data: { text: 'x'.repeat(501) },
    });
    expect(response.status()).toBe(400);
  });

  test('GET /health returns healthy status', async ({ request }) => {
    const response = await request.get('http://localhost:3000/health');
    expect(response.status()).toBe(200);
    const body = (await response.json()) as { status: string };
    expect(body.status).toBe('healthy');
  });
});
