import type { Task, TaskStatus } from './task';

export interface CreateTaskRequest {
  text: string;
}

export interface UpdateTaskRequest {
  status: TaskStatus;
}

export interface GetTasksResponse {
  tasks: Task[];
}

export interface CreateTaskResponse {
  task: Task;
}

export interface UpdateTaskResponse {
  task: Task;
}

export interface DeleteCompletedResponse {
  deletedCount: number;
}
