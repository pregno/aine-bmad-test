import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task } from '@aine/shared';
import { createTask } from '../api/tasks';
import { TASKS_QUERY_KEY } from '../lib/queryClient';

interface TasksCache {
  tasks: Task[];
}

interface CreateTaskContext {
  tempId: string;
}

let optimisticCounter = 0;

function createTempTask(text: string): Task {
  optimisticCounter += 1;
  return {
    id: `temp-${Date.now()}-${optimisticCounter}`,
    text,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onMutate: async (text): Promise<CreateTaskContext> => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const tempTask = createTempTask(text);

      queryClient.setQueryData<TasksCache>(TASKS_QUERY_KEY, (current) => ({
        tasks: [tempTask, ...(current?.tasks ?? [])],
      }));

      return {
        tempId: tempTask.id,
      };
    },
    onError: (_error, _text, context) => {
      if (!context) {
        return;
      }
      // Remove only this mutation's optimistic row to avoid
      // rolling back unrelated concurrent optimistic updates.
      queryClient.setQueryData<TasksCache>(TASKS_QUERY_KEY, (current) => {
        const tasks = current?.tasks ?? [];
        return {
          tasks: tasks.filter((existing) => existing.id !== context.tempId),
        };
      });
    },
    onSuccess: ({ task }, _text, context) => {
      if (!context) {
        return;
      }
      queryClient.setQueryData<TasksCache>(TASKS_QUERY_KEY, (current) => {
        const tasks = current?.tasks ?? [];
        return {
          tasks: tasks.map((existing) => (existing.id === context.tempId ? task : existing)),
        };
      });
    },
    onSettled: async () => {
      // Mark tasks stale for next refetch without forcing an immediate UI churn.
      await queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY, refetchType: 'none' });
    },
  });
}
