import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app';
import { getTestPrisma } from '../helpers/testDb';

describe('DELETE /api/v1/tasks/completed (integration)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 200 with deletedCount and removes only completed tasks (AC1)', async () => {
    const prisma = getTestPrisma();

    const active = await Promise.all([
      prisma.task.create({ data: { text: 'Active A', status: 'ACTIVE' } }),
      prisma.task.create({ data: { text: 'Active B', status: 'ACTIVE' } }),
      prisma.task.create({ data: { text: 'Active C', status: 'ACTIVE' } }),
    ]);
    await Promise.all([
      prisma.task.create({
        data: { text: 'Completed X', status: 'COMPLETED', completedAt: new Date() },
      }),
      prisma.task.create({
        data: { text: 'Completed Y', status: 'COMPLETED', completedAt: new Date() },
      }),
    ]);

    const response = await app.inject({
      method: 'DELETE',
      url: '/api/v1/tasks/completed',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json<{ deletedCount: number }>();
    expect(body.deletedCount).toBe(2);

    const remaining = await prisma.task.findMany();
    expect(remaining).toHaveLength(3);
    const remainingIds = remaining.map((t) => t.id);
    expect(remainingIds).toContain(active[0].id);
    expect(remainingIds).toContain(active[1].id);
    expect(remainingIds).toContain(active[2].id);
    expect(remaining.every((t) => t.status === 'ACTIVE')).toBe(true);
  });

  it('returns 200 with deletedCount 0 when no completed tasks exist (AC2)', async () => {
    const prisma = getTestPrisma();

    const active = await Promise.all([
      prisma.task.create({ data: { text: 'Stay alive 1', status: 'ACTIVE' } }),
      prisma.task.create({ data: { text: 'Stay alive 2', status: 'ACTIVE' } }),
      prisma.task.create({ data: { text: 'Stay alive 3', status: 'ACTIVE' } }),
    ]);

    const response = await app.inject({
      method: 'DELETE',
      url: '/api/v1/tasks/completed',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json<{ deletedCount: number }>();
    expect(body.deletedCount).toBe(0);

    const remaining = await prisma.task.findMany({
      where: { id: { in: active.map((t) => t.id) } },
    });
    expect(remaining).toHaveLength(3);
  });

  it('returns 200 with deletedCount 0 on empty database', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/api/v1/tasks/completed',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json<{ deletedCount: number }>();
    expect(body.deletedCount).toBe(0);
  });

  it('only active tasks appear in GET /api/v1/tasks after bulk delete (AC1 + AC2)', async () => {
    const prisma = getTestPrisma();

    const taskA = await prisma.task.create({ data: { text: 'Keep me active', status: 'ACTIVE' } });
    await prisma.task.create({
      data: { text: 'Remove me completed', status: 'COMPLETED', completedAt: new Date() },
    });

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: '/api/v1/tasks/completed',
    });
    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.json<{ deletedCount: number }>().deletedCount).toBe(1);

    const getResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/tasks',
    });
    expect(getResponse.statusCode).toBe(200);
    const { tasks } = getResponse.json<{ tasks: Array<{ id: string; status: string }> }>();
    const ids = tasks.map((t) => t.id);
    expect(ids).toContain(taskA.id);
    expect(tasks.find((t) => t.id === taskA.id)?.status).toBe('ACTIVE');
    expect(tasks.every((t) => t.status === 'ACTIVE')).toBe(true);
  });

  it('deletes all tasks when all existing tasks are completed', async () => {
    const prisma = getTestPrisma();

    await Promise.all([
      prisma.task.create({
        data: { text: 'Completed only A', status: 'COMPLETED', completedAt: new Date() },
      }),
      prisma.task.create({
        data: { text: 'Completed only B', status: 'COMPLETED', completedAt: new Date() },
      }),
      prisma.task.create({
        data: { text: 'Completed only C', status: 'COMPLETED', completedAt: new Date() },
      }),
    ]);

    const response = await app.inject({
      method: 'DELETE',
      url: '/api/v1/tasks/completed',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json<{ deletedCount: number }>();
    expect(body.deletedCount).toBe(3);

    const remaining = await prisma.task.findMany();
    expect(remaining).toHaveLength(0);
  });

  it('returns 500 with generic message when database deleteMany fails (AC3)', async () => {
    const prisma = getTestPrisma();

    const created = await prisma.task.create({
      data: { text: 'DB will fail on deleteMany', status: 'COMPLETED', completedAt: new Date() },
    });

    const requestLogger = app.log.child({});
    const requestLogErrorSpy = vi.spyOn(requestLogger, 'error');
    const childSpy = vi.spyOn(app.log, 'child').mockReturnValue(requestLogger);
    const deleteSpy = vi
      .spyOn(app.prisma.task, 'deleteMany')
      .mockRejectedValueOnce(new Error('DB connection refused'));

    const response = await app.inject({
      method: 'DELETE',
      url: '/api/v1/tasks/completed',
    });

    expect(response.statusCode).toBe(500);
    const body = response.json<{ error: string; requestId: string }>();
    expect(body.error).toBe('Internal server error');
    expect(body.requestId).toBeDefined();
    expect(requestLogErrorSpy).toHaveBeenCalled();

    childSpy.mockRestore();
    deleteSpy.mockRestore();

    const persisted = await prisma.task.findUnique({ where: { id: created.id } });
    expect(persisted).not.toBeNull();
    expect(persisted?.status).toBe('COMPLETED');
  });
});
