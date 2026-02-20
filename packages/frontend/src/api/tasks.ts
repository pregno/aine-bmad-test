import type {
  CreateTaskRequest,
  CreateTaskResponse,
  GetTasksResponse,
  UpdateTaskRequest,
  UpdateTaskResponse,
  TaskStatus,
} from '@aine/shared';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1').replace(
  /\/$/,
  ''
);

export async function fetchTasks(): Promise<GetTasksResponse> {
  const response = await fetch(`${BASE_URL}/tasks`);
  if (!response.ok) {
    throw new Error(`Failed to load tasks: ${response.status}`);
  }
  return response.json() as Promise<GetTasksResponse>;
}

export async function createTask(text: string): Promise<CreateTaskResponse> {
  const payload: CreateTaskRequest = { text: text.trim() };
  const response = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Failed to create task: ${response.status}`);
  }
  return response.json() as Promise<CreateTaskResponse>;
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus
): Promise<UpdateTaskResponse> {
  const payload: UpdateTaskRequest = { status };
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Failed to update task: ${response.status}`);
  }
  return response.json() as Promise<UpdateTaskResponse>;
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete task: ${response.status}`);
  }
  // 204 No Content — no body to parse
}

export interface ClearCompletedResponse {
  deletedCount: number;
}

export async function clearCompletedTasks(): Promise<ClearCompletedResponse> {
  const response = await fetch(`${BASE_URL}/tasks/completed`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to clear completed tasks: ${response.status}`);
  }
  return response.json() as Promise<ClearCompletedResponse>;
}
