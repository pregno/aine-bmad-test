import { useQuery } from '@tanstack/react-query';
import { fetchTasks } from '../api/tasks';
import { TASKS_QUERY_KEY } from '../lib/queryClient';

/** Configurable per AC2 (default 30s). AC1 visibility: refetchOnWindowFocus + polling. */
export const TASKS_REFETCH_INTERVAL_MS = 30_000;

export function useTasksQuery(refetchInterval: number | false = TASKS_REFETCH_INTERVAL_MS) {
  return useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: fetchTasks,
    retry: 0,
    refetchInterval,
    refetchIntervalInBackground: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
}
