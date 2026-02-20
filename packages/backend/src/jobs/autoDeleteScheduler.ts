import cron from 'node-cron';
import type { PrismaClient } from '@prisma/client';
import type { FastifyBaseLogger } from 'fastify';
import { autoDeleteCompletedTasks } from './autoDeleteCompletedTasks';

/** Default schedule: run every hour at minute 0 */
const DEFAULT_SCHEDULE = '0 * * * *';

/**
 * Registers the auto-delete cron job and returns the task handle for lifecycle management.
 * The scheduler runs `autoDeleteCompletedTasks` on each tick; errors are isolated inside the job.
 */
export function startAutoDeleteScheduler(
  prisma: PrismaClient,
  logger: FastifyBaseLogger,
  cronExpression: string = DEFAULT_SCHEDULE
): cron.ScheduledTask {
  const task = cron.schedule(cronExpression, () => {
    void autoDeleteCompletedTasks(prisma, logger);
  });

  const scheduleMessage =
    cronExpression === DEFAULT_SCHEDULE
      ? 'Cleanup job scheduled: every 1 hour'
      : `Cleanup job scheduled: ${cronExpression}`;
  logger.info({ cronExpression }, scheduleMessage);

  return task;
}
