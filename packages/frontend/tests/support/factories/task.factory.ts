import type { Task } from '@aine/shared';
import { TaskStatus } from '@aine/shared';

export interface TaskOverrides {
  id?: string;
  text?: string;
  status?: TaskStatus;
  createdAt?: string;
  completedAt?: string | null;
}

/**
 * Create a single task with optional overrides.
 * Uses deterministic-ish data when no overrides (timestamp-based for uniqueness).
 */
export function createTask(overrides: TaskOverrides = {}): Task {
  const now = new Date().toISOString();
  return {
    id: overrides.id ?? `test-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    text: overrides.text ?? `Task ${Date.now()}`,
    status: overrides.status ?? TaskStatus.ACTIVE,
    createdAt: overrides.createdAt ?? now,
    completedAt: overrides.completedAt ?? null,
  };
}

/**
 * Create an array of tasks with optional overrides per item.
 */
export function createTasks(count: number, overrides: TaskOverrides[] = []): Task[] {
  return Array.from({ length: count }, (_, i) => createTask(overrides[i] ?? {}));
}
