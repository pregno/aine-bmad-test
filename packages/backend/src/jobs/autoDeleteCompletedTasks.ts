import type { PrismaClient } from '@prisma/client';
import type { FastifyBaseLogger } from 'fastify';

export interface AutoDeleteResult {
  deletedCount: number;
  executionTimeMs: number;
}

/**
 * Deletes all COMPLETED tasks whose `completedAt` timestamp is older than 24 hours.
 * Tasks with null `completedAt` are never matched and thus never deleted.
 * All errors are caught and logged; the function never throws.
 */
export async function autoDeleteCompletedTasks(
  prisma: PrismaClient,
  logger: FastifyBaseLogger
): Promise<AutoDeleteResult> {
  const startTime = Date.now();
  const cutoffDate = new Date(startTime - 24 * 60 * 60 * 1000);

  try {
    const expiredTasks = await prisma.task.findMany({
      where: {
        status: 'COMPLETED',
        // `not: null` ensures null completedAt values are never deleted (AC1 safety)
        completedAt: { not: null, lt: cutoffDate },
      },
      select: { id: true, completedAt: true },
    });

    let deletedCount = 0;

    if (expiredTasks.length > 0) {
      for (const task of expiredTasks) {
        logger.info(
          { taskId: task.id, completedAt: task.completedAt },
          'Auto-deleting expired completed task'
        );
      }

      const deleteResult = await prisma.task.deleteMany({
        where: {
          id: { in: expiredTasks.map((t) => t.id) },
          status: 'COMPLETED',
          completedAt: { not: null, lt: cutoffDate },
        },
      });
      deletedCount = deleteResult.count;
    }

    const executionTimeMs = Date.now() - startTime;

    if (deletedCount > 0) {
      logger.info(
        { deletedCount, executionTimeMs },
        `Auto-deleted ${deletedCount} completed tasks older than 24 hours`
      );
    } else {
      logger.info({ deletedCount: 0, executionTimeMs }, 'Auto-cleanup completed: 0 tasks deleted');
    }

    return { deletedCount, executionTimeMs };
  } catch (error) {
    const executionTimeMs = Date.now() - startTime;
    logger.error({ err: error, executionTimeMs }, 'Auto-delete cleanup job failed');
    return { deletedCount: 0, executionTimeMs };
  }
}
