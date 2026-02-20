import { z } from 'zod';
import cron from 'node-cron';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  FRONTEND_URL: z.string().url().optional(),
  AUTO_DELETE_CRON: z
    .string()
    .optional()
    .refine((value) => value === undefined || cron.validate(value), {
      message: 'AUTO_DELETE_CRON must be a valid cron expression',
    }),
});

export type Env = z.infer<typeof envSchema>;
