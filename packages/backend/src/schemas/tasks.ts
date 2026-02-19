import { z } from 'zod';
import { TaskStatus } from '@aine/shared';

export const createTaskSchema = z.object({
  text: z
    .string({ required_error: 'Task text is required' })
    .transform((s) => s.trim())
    .pipe(
      z
        .string()
        .min(1, 'Task text is required')
        .max(500, 'Task text must be 500 characters or less')
    ),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z
  .object({
    status: z.nativeEnum(TaskStatus, {
      errorMap: () => ({ message: 'Status must be "ACTIVE" or "COMPLETED"' }),
    }),
  })
  .strict();

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const uuidParamSchema = z.string().uuid({ message: 'Invalid task ID format' });
