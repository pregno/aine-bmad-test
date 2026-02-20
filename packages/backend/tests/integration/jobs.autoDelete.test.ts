import { describe, it, expect, vi, afterEach } from 'vitest';
import type { FastifyBaseLogger } from 'fastify';
import { getTestPrisma } from '../helpers/testDb';
import { autoDeleteCompletedTasks } from '../../src/jobs/autoDeleteCompletedTasks';

function createMockLogger(): FastifyBaseLogger {
  return {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    fatal: vi.fn(),
    child: vi.fn(),
  } as unknown as FastifyBaseLogger;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('autoDeleteCompletedTasks (integration)', () => {
  it('permanently deletes a task completed more than 24 hours ago and logs per-task info (AC1)', async () => {
    const prisma = getTestPrisma();
    const logger = createMockLogger();
    const now = new Date();

    const oldTask = await prisma.task.create({
      data: {
        text: 'Old completed task',
        status: 'COMPLETED',
        completedAt: new Date(now.getTime() - 25 * 60 * 60 * 1000),
      },
    });

    const result = await autoDeleteCompletedTasks(prisma, logger);

    expect(result.deletedCount).toBe(1);

    const found = await prisma.task.findUnique({ where: { id: oldTask.id } });
    expect(found).toBeNull();

    // AC1: per-task log includes taskId and completedAt
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ taskId: oldTask.id }),
      'Auto-deleting expired completed task'
    );
  });

  it('retains a task completed 12 hours ago (within 24-hour window) (AC2)', async () => {
    const prisma = getTestPrisma();
    const logger = createMockLogger();
    const now = new Date();

    const recentTask = await prisma.task.create({
      data: {
        text: 'Recent completed task',
        status: 'COMPLETED',
        completedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      },
    });

    const result = await autoDeleteCompletedTasks(prisma, logger);

    expect(result.deletedCount).toBe(0);

    const found = await prisma.task.findUnique({ where: { id: recentTask.id } });
    expect(found).not.toBeNull();
  });

  it('retains a task completed exactly 24 hours ago (strictly older-than cutoff) (AC2 boundary)', async () => {
    const prisma = getTestPrisma();
    const logger = createMockLogger();
    const fixedNow = new Date('2026-02-20T12:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);

    const boundaryTask = await prisma.task.create({
      data: {
        text: 'Boundary completed task',
        status: 'COMPLETED',
        completedAt: new Date(fixedNow.getTime() - 24 * 60 * 60 * 1000),
      },
    });

    const result = await autoDeleteCompletedTasks(prisma, logger);

    expect(result.deletedCount).toBe(0);
    const found = await prisma.task.findUnique({ where: { id: boundaryTask.id } });
    expect(found).not.toBeNull();
  });

  it('deletes exactly 15 old tasks and retains 5 recent tasks from a mixed dataset (AC3)', async () => {
    const prisma = getTestPrisma();
    const logger = createMockLogger();
    const now = new Date();

    const oldTasks = await Promise.all(
      Array.from({ length: 15 }, (_, i) =>
        prisma.task.create({
          data: {
            text: `Old task ${i}`,
            status: 'COMPLETED',
            completedAt: new Date(now.getTime() - (25 + i) * 60 * 60 * 1000),
          },
        })
      )
    );

    const recentTasks = await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        prisma.task.create({
          data: {
            text: `Recent task ${i}`,
            status: 'COMPLETED',
            completedAt: new Date(now.getTime() - (1 + i) * 60 * 60 * 1000),
          },
        })
      )
    );

    const result = await autoDeleteCompletedTasks(prisma, logger);

    expect(result.deletedCount).toBe(15);

    for (const task of oldTasks) {
      const found = await prisma.task.findUnique({ where: { id: task.id } });
      expect(found).toBeNull();
    }
    for (const task of recentTasks) {
      const found = await prisma.task.findUnique({ where: { id: task.id } });
      expect(found).not.toBeNull();
    }

    // AC3: summary log
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ deletedCount: 15 }),
      'Auto-deleted 15 completed tasks older than 24 hours'
    );
  });

  it('logs execution time and deletedCount after a successful run (AC5)', async () => {
    const prisma = getTestPrisma();
    const logger = createMockLogger();

    const result = await autoDeleteCompletedTasks(prisma, logger);

    expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ executionTimeMs: expect.any(Number) }),
      expect.any(String)
    );
  });

  it('logs error and returns gracefully without crashing when DB fails (AC6)', async () => {
    const prisma = getTestPrisma();
    const logger = createMockLogger();

    vi.spyOn(prisma.task, 'findMany').mockRejectedValueOnce(new Error('DB connection refused'));

    const result = await autoDeleteCompletedTasks(prisma, logger);

    expect(result.deletedCount).toBe(0);
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ err: expect.any(Error) }),
      'Auto-delete cleanup job failed'
    );
  });

  it('completes cleanup without deleting locally recent tasks (AC7)', async () => {
    const prisma = getTestPrisma();
    const logger = createMockLogger();
    const now = new Date();

    const recentTask = await prisma.task.create({
      data: {
        text: 'Recent task for AC7',
        status: 'COMPLETED',
        completedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
    });

    const result = await autoDeleteCompletedTasks(prisma, logger);

    expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);
    const found = await prisma.task.findUnique({ where: { id: recentTask.id } });
    expect(found).not.toBeNull();
  });

  it('does not delete active tasks or COMPLETED tasks with null completedAt (AC1 safety)', async () => {
    const prisma = getTestPrisma();
    const logger = createMockLogger();

    const activeTask = await prisma.task.create({
      data: { text: 'Active task stays', status: 'ACTIVE' },
    });

    const completedNullAt = await prisma.task.create({
      data: { text: 'Completed but null completedAt', status: 'COMPLETED', completedAt: null },
    });

    const result = await autoDeleteCompletedTasks(prisma, logger);

    expect(result.deletedCount).toBe(0);

    const active = await prisma.task.findUnique({ where: { id: activeTask.id } });
    expect(active).not.toBeNull();

    const nullAt = await prisma.task.findUnique({ where: { id: completedNullAt.id } });
    expect(nullAt).not.toBeNull();
  });
});
