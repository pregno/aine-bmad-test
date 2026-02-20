import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import type { FastifyBaseLogger } from 'fastify';

vi.mock('node-cron', () => ({
  default: {
    schedule: vi.fn().mockReturnValue({
      start: vi.fn(),
      stop: vi.fn(),
      destroy: vi.fn(),
    }),
  },
}));

vi.mock('./autoDeleteCompletedTasks', () => ({
  autoDeleteCompletedTasks: vi.fn().mockResolvedValue({ deletedCount: 0, executionTimeMs: 5 }),
}));

import cron from 'node-cron';
import { autoDeleteCompletedTasks } from './autoDeleteCompletedTasks';
import { startAutoDeleteScheduler } from './autoDeleteScheduler';

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

function createMockPrisma(): PrismaClient {
  return {} as unknown as PrismaClient;
}

describe('startAutoDeleteScheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cron.schedule).mockReturnValue({
      start: vi.fn(),
      stop: vi.fn(),
      destroy: vi.fn(),
    } as unknown as cron.ScheduledTask);
  });

  it('schedules cron job with default hourly expression and logs registration (AC4)', () => {
    const logger = createMockLogger();
    const prisma = createMockPrisma();

    startAutoDeleteScheduler(prisma, logger);

    expect(cron.schedule).toHaveBeenCalledWith('0 * * * *', expect.any(Function));
    expect(logger.info).toHaveBeenCalledWith(
      { cronExpression: '0 * * * *' },
      'Cleanup job scheduled: every 1 hour'
    );
  });

  it('schedules cron job with custom expression when AUTO_DELETE_CRON is set (AC4)', () => {
    const logger = createMockLogger();
    const prisma = createMockPrisma();
    const customCron = '*/30 * * * *';

    startAutoDeleteScheduler(prisma, logger, customCron);

    expect(cron.schedule).toHaveBeenCalledWith(customCron, expect.any(Function));
    expect(logger.info).toHaveBeenCalledWith(
      { cronExpression: customCron },
      `Cleanup job scheduled: ${customCron}`
    );
  });

  it('returns a scheduled task with stop() for lifecycle management (AC4)', () => {
    const logger = createMockLogger();
    const prisma = createMockPrisma();

    const task = startAutoDeleteScheduler(prisma, logger);

    expect(task).toBeDefined();
    expect(typeof task.stop).toBe('function');
  });

  it('invokes autoDeleteCompletedTasks when the scheduled callback fires (AC5)', async () => {
    const logger = createMockLogger();
    const prisma = createMockPrisma();

    let capturedCallback: (() => void) | undefined;
    vi.mocked(cron.schedule).mockImplementation((_expr, callback) => {
      capturedCallback = callback as () => void;
      return { start: vi.fn(), stop: vi.fn(), destroy: vi.fn() } as unknown as cron.ScheduledTask;
    });

    startAutoDeleteScheduler(prisma, logger);

    expect(capturedCallback).toBeDefined();
    capturedCallback!();

    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    expect(autoDeleteCompletedTasks).toHaveBeenCalledWith(prisma, logger);
  });
});
