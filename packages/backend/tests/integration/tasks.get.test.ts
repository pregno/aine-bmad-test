import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app';
import { getTestPrisma } from '../helpers/testDb';

describe('GET /api/v1/tasks (integration)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 200 with empty tasks array when database has no tasks (AC2)', async () => {
    const prisma = getTestPrisma();
    await prisma.task.deleteMany();

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/tasks',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json<{ tasks: unknown[] }>();
    expect(body.tasks).toEqual([]);
  });

  it('returns 200 with tasks in correct order: active DESC, completed ASC, active before completed (AC1)', async () => {
    const prisma = getTestPrisma();
    await prisma.task.deleteMany();

    const now = new Date();
    const [t1, t2, t3, t4] = await Promise.all([
      prisma.task.create({
        data: {
          text: 'Active oldest',
          status: 'ACTIVE',
          createdAt: new Date(now.getTime() - 3000),
        },
      }),
      prisma.task.create({
        data: {
          text: 'Active newest',
          status: 'ACTIVE',
          createdAt: new Date(now.getTime()),
        },
      }),
      prisma.task.create({
        data: {
          text: 'Completed oldest',
          status: 'COMPLETED',
          createdAt: new Date(now.getTime() - 5000),
          completedAt: new Date(now.getTime() - 2000),
        },
      }),
      prisma.task.create({
        data: {
          text: 'Completed newest',
          status: 'COMPLETED',
          createdAt: new Date(now.getTime() - 4000),
          completedAt: new Date(now.getTime()),
        },
      }),
    ]);

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/tasks',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json<{
      tasks: Array<{
        id: string;
        text: string;
        status: string;
        createdAt: string;
        completedAt: string | null;
      }>;
    }>();
    expect(body.tasks).toHaveLength(4);

    // Active first (newest first): t2, t1
    expect(body.tasks[0].id).toBe(t2.id);
    expect(body.tasks[0].status).toBe('ACTIVE');
    expect(body.tasks[1].id).toBe(t1.id);
    expect(body.tasks[1].status).toBe('ACTIVE');

    // Completed after (oldest completedAt first): t3, t4
    expect(body.tasks[2].id).toBe(t3.id);
    expect(body.tasks[2].status).toBe('COMPLETED');
    expect(body.tasks[3].id).toBe(t4.id);
    expect(body.tasks[3].status).toBe('COMPLETED');
  });

  it('task JSON includes createdAt and completedAt; completedAt is null for active tasks (AC4)', async () => {
    const prisma = getTestPrisma();
    await prisma.task.deleteMany();
    const created = await prisma.task.create({
      data: { text: 'Active task', status: 'ACTIVE' },
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/tasks',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json<{
      tasks: Array<{
        id: string;
        text: string;
        status: string;
        createdAt: string;
        completedAt: string | null;
      }>;
    }>();
    expect(body.tasks).toHaveLength(1);
    expect(body.tasks[0].id).toBe(created.id);
    expect(body.tasks[0].createdAt).toBeDefined();
    expect(typeof body.tasks[0].createdAt).toBe('string');
    expect(body.tasks[0].completedAt).toBeNull();
  });

  it('completed task JSON includes non-null completedAt (AC4)', async () => {
    const prisma = getTestPrisma();
    await prisma.task.deleteMany();
    const completedAt = new Date('2026-02-18T12:00:00.000Z');
    const created = await prisma.task.create({
      data: {
        text: 'Completed task',
        status: 'COMPLETED',
        completedAt,
      },
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/tasks',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json<{
      tasks: Array<{
        id: string;
        completedAt: string | null;
      }>;
    }>();
    expect(body.tasks).toHaveLength(1);
    expect(body.tasks[0].id).toBe(created.id);
    expect(body.tasks[0].completedAt).toBe(completedAt.toISOString());
  });

  it('returns 500 with generic message when database findMany fails (AC3)', async () => {
    const findManySpy = vi
      .spyOn(app.prisma.task, 'findMany')
      .mockRejectedValueOnce(new Error('DB connection refused'));

    try {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/tasks',
      });

      expect(response.statusCode).toBe(500);
      const body = response.json<{ error: string; requestId: string; path: string }>();
      expect(body.error).toBe('Internal server error');
      expect(body.path).toBe('/api/v1/tasks');
      expect(body.requestId).toBeDefined();
    } finally {
      findManySpy.mockRestore();
    }
  });
});
