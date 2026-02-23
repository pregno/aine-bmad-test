/**
 * API helpers for E2E tests.
 * Uses baseURL convention: frontend :5173, backend :3000.
 */

const getBackendBase = (frontendBase: string): string => {
  return frontendBase.replace('5173', '3000');
};

export async function fetchTasks(baseURL: string): Promise<{ id: string }[]> {
  const res = await fetch(`${getBackendBase(baseURL)}/api/v1/tasks`);
  const { tasks } = (await res.json()) as { tasks: { id: string }[] };
  return tasks;
}

export async function deleteTask(baseURL: string, id: string): Promise<void> {
  await fetch(`${getBackendBase(baseURL)}/api/v1/tasks/${id}`, {
    method: 'DELETE',
  });
}

export async function deleteCompletedTasks(baseURL: string): Promise<number> {
  const res = await fetch(`${getBackendBase(baseURL)}/api/v1/tasks/completed`, {
    method: 'DELETE',
  });
  const { deletedCount } = (await res.json()) as { deletedCount: number };
  return deletedCount;
}
