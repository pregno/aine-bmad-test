import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FastifyBaseLogger } from 'fastify';
import cron from 'node-cron';
import { getTestPrisma } from '../helpers/testDb';
import { startAutoDeleteScheduler } from '../../src/jobs/autoDeleteScheduler';

vi.mock('node-cron', () => ({
  default: {
    schedule: vi.fn().mockReturnValue({
      start: vi.fn(),
      stop: vi.fn(),
      destroy: vi.fn(),
    }),
  },
}));

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

describe('auto-delete scheduler (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('scheduled callback runs cleanup against the real DB state (scheduler execution path)', async () => {
    const prisma = getTestPrisma();
    const logger = createMockLogger();
    const now = new Date();

    const oldTask = await prisma.task.create({
      data: {
        text: 'Old completed from scheduler',
        status: 'COMPLETED',
        completedAt: new Date(now.getTime() - 25 * 60 * 60 * 1000),
      },
    });

    let scheduledCallback: (() => void) | undefined;
    vi.mocked(cron.schedule).mockImplementation((_expr, callback) => {
      scheduledCallback = callback as () => void;
      return { start: vi.fn(), stop: vi.fn(), destroy: vi.fn() } as unknown as cron.ScheduledTask;
    });

    const task = startAutoDeleteScheduler(prisma, logger);
    expect(task).toBeDefined();
    expect(scheduledCallback).toBeDefined();

    scheduledCallback?.();
    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    const found = await prisma.task.findUnique({ where: { id: oldTask.id } });
    expect(found).toBeNull();
  });
});
