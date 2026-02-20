import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task } from '@aine/shared';
import { TaskStatus } from '@aine/shared';
import { clearCompletedTasks } from '../api/tasks';
import { TASKS_QUERY_KEY } from '../lib/queryClient';

interface TasksCache {
  tasks: Task[];
}

interface ClearCompletedVars {
  completedTaskIds: string[];
}

interface ClearCompletedContext {
  previousTasks: TasksCache | undefined;
  timeoutIds: number[];
}

export function useClearCompletedTasksMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (_vars: ClearCompletedVars) => clearCompletedTasks(),
    retry: 0, // CRITICAL: No retry for DELETE — rollback must be immediate
    onMutate: async (vars): Promise<ClearCompletedContext> => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasks = queryClient.getQueryData<TasksCache>(TASKS_QUERY_KEY);
      const timeoutIds: number[] = [];

      const targetIds = new Set(vars.completedTaskIds);
      const completedIdsInOrder = (previousTasks?.tasks ?? [])
        .filter((task) => task.status === TaskStatus.COMPLETED && targetIds.has(task.id))
        .map((task) => task.id);

      completedIdsInOrder.forEach((id, index) => {
        const timeoutId = window.setTimeout(
          () => {
            queryClient.setQueryData<TasksCache>(TASKS_QUERY_KEY, (current) => ({
              tasks: (current?.tasks ?? []).filter(
                (task) => !(task.status === TaskStatus.COMPLETED && task.id === id)
              ),
            }));
          },
          (index + 1) * 50
        );
        timeoutIds.push(timeoutId);
      });

      return { previousTasks, timeoutIds };
    },
    onError: (_error, _vars, context) => {
      context?.timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      if (context?.previousTasks !== undefined) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY, refetchType: 'none' });
    },
  });
}
