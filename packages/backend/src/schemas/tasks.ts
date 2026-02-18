import { z } from 'zod';

export const createTaskSchema = z.object({
  text: z
    .string()
    .min(1, 'Task text is required')
    .max(500, 'Task text must be 500 characters or less'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
