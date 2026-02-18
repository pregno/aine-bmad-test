import type { CreateTaskRequest, CreateTaskResponse, GetTasksResponse } from '@aine/shared';

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
