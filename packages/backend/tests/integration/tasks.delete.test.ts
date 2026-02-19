import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app';
import { getTestPrisma } from '../helpers/testDb';

describe('DELETE /api/v1/tasks/:id (integration)', () => {
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

  it('returns 204 with empty body and removes task from database (AC1)', async () => {
    const prisma = getTestPrisma();
    const created = await prisma.task.create({
      data: { text: 'Task to delete', status: 'ACTIVE' },
    });

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/v1/tasks/${created.id}`,
    });

    expect(response.statusCode).toBe(204);
    expect(response.payload).toBe('');

    const persisted = await prisma.task.findUnique({ where: { id: created.id } });
    expect(persisted).toBeNull();
  });

  it('returns 204 and removes a COMPLETED task from database', async () => {
    const prisma = getTestPrisma();
    const created = await prisma.task.create({
      data: { text: 'Completed task to delete', status: 'COMPLETED', completedAt: new Date() },
    });

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/v1/tasks/${created.id}`,
    });

    expect(response.statusCode).toBe(204);
    expect(response.payload).toBe('');

    const persisted = await prisma.task.findUnique({ where: { id: created.id } });
    expect(persisted).toBeNull();
  });

  it('returns 404 when task id does not exist (AC2)', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/v1/tasks/${nonExistentId}`,
    });

    expect(response.statusCode).toBe(404);
    const body = response.json<{ error: string; code: string }>();
    expect(body.error).toContain('Task not found');
    expect(body.code).toBe('TASK_NOT_FOUND');
  });

  it('returns 400 when task id is not a valid UUID', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/api/v1/tasks/not-a-valid-uuid',
    });

    expect(response.statusCode).toBe(400);
    const body = response.json<{ error: string; code: string }>();
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.error).toContain('Invalid task ID');
  });

  it('deleted task does not appear in GET /api/v1/tasks (AC3)', async () => {
    const prisma = getTestPrisma();
    const taskA = await prisma.task.create({
      data: { text: 'Task A to delete', status: 'ACTIVE' },
    });
    const taskB = await prisma.task.create({
      data: { text: 'Task B to keep', status: 'ACTIVE' },
    });

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/v1/tasks/${taskA.id}`,
    });
    expect(deleteResponse.statusCode).toBe(204);

    const getResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/tasks',
    });
    expect(getResponse.statusCode).toBe(200);
    const { tasks } = getResponse.json<{ tasks: Array<{ id: string; text: string }> }>();
    const ids = tasks.map((t) => t.id);
    expect(ids).not.toContain(taskA.id);
    expect(ids).toContain(taskB.id);
  });

  it('returns 404 when deleting an already-deleted task', async () => {
    const prisma = getTestPrisma();
    const created = await prisma.task.create({
      data: { text: 'Task to delete twice', status: 'ACTIVE' },
    });

    const firstResponse = await app.inject({
      method: 'DELETE',
      url: `/api/v1/tasks/${created.id}`,
    });
    expect(firstResponse.statusCode).toBe(204);

    const secondResponse = await app.inject({
      method: 'DELETE',
      url: `/api/v1/tasks/${created.id}`,
    });
    expect(secondResponse.statusCode).toBe(404);
    const body = secondResponse.json<{ error: string; code: string }>();
    expect(body.error).toContain('Task not found');
    expect(body.code).toBe('TASK_NOT_FOUND');
  });

  it('returns 500 with generic message when database delete fails (AC4)', async () => {
    const prisma = getTestPrisma();
    const created = await prisma.task.create({
      data: { text: 'DB will fail on delete', status: 'ACTIVE' },
    });

    const deleteSpy = vi
      .spyOn(app.prisma.task, 'delete')
      .mockRejectedValueOnce(new Error('DB connection refused'));

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/v1/tasks/${created.id}`,
    });

    expect(response.statusCode).toBe(500);
    const body = response.json<{ error: string; requestId: string; path: string }>();
    expect(body.error).toBe('Internal server error');
    expect(body.requestId).toBeDefined();

    deleteSpy.mockRestore();

    const persisted = await prisma.task.findUnique({ where: { id: created.id } });
    expect(persisted).not.toBeNull();
    expect(persisted?.status).toBe('ACTIVE');
  });
});
