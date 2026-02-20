import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task } from '@aine/shared';
import { deleteTask } from '../api/tasks';
import { TASKS_QUERY_KEY } from '../lib/queryClient';

interface TasksCache {
  tasks: Task[];
}

interface DeleteTaskContext {
  previousTasks: TasksCache | undefined;
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    retry: 0, // CRITICAL: No retry for DELETE — rollback must be immediate
    onMutate: async (id): Promise<DeleteTaskContext> => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasks = queryClient.getQueryData<TasksCache>(TASKS_QUERY_KEY);

      queryClient.setQueryData<TasksCache>(TASKS_QUERY_KEY, (current) => ({
        tasks: (current?.tasks ?? []).filter((t) => t.id !== id),
      }));

      return { previousTasks };
    },
    onError: (_error, _vars, context) => {
      if (context?.previousTasks !== undefined) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
    },
    // onSuccess: task already removed from cache — nothing to do
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY, refetchType: 'none' });
    },
  });
}
