import { QueryClient } from '@tanstack/react-query';

export const TASKS_QUERY_KEY = ['tasks'] as const;

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
