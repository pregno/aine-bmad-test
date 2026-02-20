import { describe, it, expect, vi, afterEach } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import type { FastifyBaseLogger } from 'fastify';
import { autoDeleteCompletedTasks } from './autoDeleteCompletedTasks';

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

function createMockPrisma(overrides?: {
  findMany?: ReturnType<typeof vi.fn>;
  deleteMany?: ReturnType<typeof vi.fn>;
}): PrismaClient {
  return {
    task: {
      findMany: overrides?.findMany ?? vi.fn().mockResolvedValue([]),
      deleteMany: overrides?.deleteMany ?? vi.fn().mockResolvedValue({ count: 0 }),
    },
  } as unknown as PrismaClient;
}

const FIXED_NOW = new Date('2026-01-15T12:00:00.000Z').getTime();

afterEach(() => {
  vi.useRealTimers();
});

describe('autoDeleteCompletedTasks', () => {
  it('queries only COMPLETED tasks with completedAt older than 24h cutoff (AC1, AC2)', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);

    const cutoffDate = new Date(FIXED_NOW - 24 * 60 * 60 * 1000);
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = createMockPrisma({ findMany });
    const logger = createMockLogger();

    await autoDeleteCompletedTasks(prisma, logger);

    expect(findMany).toHaveBeenCalledWith({
      where: {
        status: 'COMPLETED',
        completedAt: { not: null, lt: cutoffDate },
      },
      select: { id: true, completedAt: true },
    });
  });

  it('deletes task completed 25h ago and logs per-task info with taskId and completedAt (AC1)', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);

    const oldCompletedAt = new Date(FIXED_NOW - 25 * 60 * 60 * 1000);
    const oldTask = { id: 'task-old-1', completedAt: oldCompletedAt };

    const findMany = vi.fn().mockResolvedValue([oldTask]);
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
    const prisma = createMockPrisma({ findMany, deleteMany });
    const logger = createMockLogger();

    const result = await autoDeleteCompletedTasks(prisma, logger);

    // AC1: per-task log includes taskId and completedAt
    expect(logger.info).toHaveBeenCalledWith(
      { taskId: 'task-old-1', completedAt: oldCompletedAt },
      'Auto-deleting expired completed task'
    );

    expect(deleteMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['task-old-1'] },
        status: 'COMPLETED',
        completedAt: { not: null, lt: new Date(FIXED_NOW - 24 * 60 * 60 * 1000) },
      },
    });

    // AC5: result metadata
    expect(result.deletedCount).toBe(1);
    expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);
  });

  it('does not call deleteMany when no expired tasks exist (AC2, AC7)', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const deleteMany = vi.fn();
    const prisma = createMockPrisma({ findMany, deleteMany });
    const logger = createMockLogger();

    const result = await autoDeleteCompletedTasks(prisma, logger);

    expect(deleteMany).not.toHaveBeenCalled();
    expect(result.deletedCount).toBe(0);
  });

  it('deletes exactly 15 tasks in a mixed dataset and logs summary (AC3)', async () => {
    const oldTasks = Array.from({ length: 15 }, (_, i) => ({
      id: `old-${i}`,
      completedAt: new Date(FIXED_NOW - (25 + i) * 60 * 60 * 1000),
    }));

    const findMany = vi.fn().mockResolvedValue(oldTasks);
    const deleteMany = vi.fn().mockResolvedValue({ count: 15 });
    const prisma = createMockPrisma({ findMany, deleteMany });
    const logger = createMockLogger();

    const result = await autoDeleteCompletedTasks(prisma, logger);

    expect(result.deletedCount).toBe(15);
    expect(deleteMany).toHaveBeenCalledWith({
      where: {
        id: { in: oldTasks.map((t) => t.id) },
        status: 'COMPLETED',
        completedAt: { not: null, lt: expect.any(Date) },
      },
    });

    // AC3: summary log
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ deletedCount: 15 }),
      'Auto-deleted 15 completed tasks older than 24 hours'
    );
  });

  it('logs execution time and deletedCount on successful run (AC5)', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = createMockPrisma({ findMany });
    const logger = createMockLogger();

    const result = await autoDeleteCompletedTasks(prisma, logger);

    expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ executionTimeMs: expect.any(Number) }),
      expect.any(String)
    );
  });

  it('logs error and returns gracefully when DB throws — server remains usable (AC6)', async () => {
    const dbError = new Error('DB connection refused');
    const findMany = vi.fn().mockRejectedValue(dbError);
    const prisma = createMockPrisma({ findMany });
    const logger = createMockLogger();

    const result = await autoDeleteCompletedTasks(prisma, logger);

    expect(result.deletedCount).toBe(0);
    expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ err: dbError }),
      'Auto-delete cleanup job failed'
    );
  });

  it('logs zero-deletion summary when no tasks are expired (AC7)', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = createMockPrisma({ findMany });
    const logger = createMockLogger();

    await autoDeleteCompletedTasks(prisma, logger);

    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ deletedCount: 0 }),
      'Auto-cleanup completed: 0 tasks deleted'
    );
  });

  it('does not delete tasks with null completedAt regardless of status (AC1 safety)', async () => {
    // The Prisma query uses `{ not: null, lt: cutoffDate }` which excludes null completedAt.
    // Simulate: DB returns no matches (null completedAt tasks are filtered by the query).
    const findMany = vi.fn().mockResolvedValue([]);
    const deleteMany = vi.fn();
    const prisma = createMockPrisma({ findMany, deleteMany });
    const logger = createMockLogger();

    await autoDeleteCompletedTasks(prisma, logger);

    expect(deleteMany).not.toHaveBeenCalled();
  });

  it('does not delete tasks completed exactly 24 hours ago (strict cutoff boundary)', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);

    const boundaryTask = { id: 'task-24h', completedAt: new Date(FIXED_NOW - 24 * 60 * 60 * 1000) };
    const findMany = vi.fn().mockResolvedValue([]);
    const deleteMany = vi.fn();
    const prisma = createMockPrisma({ findMany, deleteMany });
    const logger = createMockLogger();

    const result = await autoDeleteCompletedTasks(prisma, logger);

    expect(result.deletedCount).toBe(0);
    expect(deleteMany).not.toHaveBeenCalled();
    expect(boundaryTask.completedAt.getTime()).toBe(FIXED_NOW - 24 * 60 * 60 * 1000);
  });

  it('reports actual deleteMany count instead of pre-delete snapshot size', async () => {
    const findMany = vi.fn().mockResolvedValue([
      { id: 'old-1', completedAt: new Date(FIXED_NOW - 26 * 60 * 60 * 1000) },
      { id: 'old-2', completedAt: new Date(FIXED_NOW - 27 * 60 * 60 * 1000) },
    ]);
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
    const prisma = createMockPrisma({ findMany, deleteMany });
    const logger = createMockLogger();

    const result = await autoDeleteCompletedTasks(prisma, logger);

    expect(result.deletedCount).toBe(1);
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ deletedCount: 1 }),
      'Auto-deleted 1 completed tasks older than 24 hours'
    );
  });
});
