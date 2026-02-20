import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskStatus } from '@aine/shared';
import type { Task } from '@aine/shared';
import { updateTaskStatus } from '../api/tasks';
import { TASKS_QUERY_KEY } from '../lib/queryClient';

interface TasksCache {
  tasks: Task[];
}

interface UpdateTaskContext {
  previousTasks: TasksCache | undefined;
}

export function useUpdateTaskStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      updateTaskStatus(id, status),
    retry: 0,
    onMutate: async ({ id, status }): Promise<UpdateTaskContext> => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasks = queryClient.getQueryData<TasksCache>(TASKS_QUERY_KEY);

      queryClient.setQueryData<TasksCache>(TASKS_QUERY_KEY, (current) => {
        const tasks = current?.tasks ?? [];
        return {
          tasks: tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  completedAt: status === TaskStatus.COMPLETED ? new Date().toISOString() : null,
                }
              : t
          ),
        };
      });

      return { previousTasks };
    },
    onError: (_error, _vars, context) => {
      if (context?.previousTasks !== undefined) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
    },
    onSuccess: ({ task }) => {
      queryClient.setQueryData<TasksCache>(TASKS_QUERY_KEY, (current) => {
        const tasks = current?.tasks ?? [];
        return {
          tasks: tasks.map((t) => (t.id === task.id ? task : t)),
        };
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY, refetchType: 'none' });
    },
  });
}
