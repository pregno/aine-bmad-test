import { useQuery } from '@tanstack/react-query';
import { fetchTasks } from '../api/tasks';
import { TASKS_QUERY_KEY } from '../lib/queryClient';

export function useTasksQuery() {
  return useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: fetchTasks,
    retry: 0,
  });
}
