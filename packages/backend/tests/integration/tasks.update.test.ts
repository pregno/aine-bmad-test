import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app';
import { getTestPrisma } from '../helpers/testDb';

describe('PATCH /api/v1/tasks/:id (integration)', () => {
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

  it('returns 200 with completedAt set when marking ACTIVE task as COMPLETED (AC1)', async () => {
    const prisma = getTestPrisma();
    const created = await prisma.task.create({
      data: { text: 'Review PR #123', status: 'ACTIVE' },
    });

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/v1/tasks/${created.id}`,
      headers: { 'content-type': 'application/json' },
      payload: { status: 'COMPLETED' },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json<{
      task: { id: string; status: string; completedAt: string | null };
    }>();
    expect(body.task.id).toBe(created.id);
    expect(body.task.status).toBe('COMPLETED');
    expect(body.task.completedAt).not.toBeNull();
    expect(typeof body.task.completedAt).toBe('string');
    // Verify it's a valid ISO timestamp
    expect(new Date(body.task.completedAt!).getTime()).toBeGreaterThan(0);

    const persisted = await prisma.task.findUnique({ where: { id: created.id } });
    expect(persisted?.status).toBe('COMPLETED');
    expect(persisted?.completedAt).not.toBeNull();
  });

  it('returns 200 with completedAt null when marking COMPLETED task back to ACTIVE (AC2)', async () => {
    const prisma = getTestPrisma();
    const created = await prisma.task.create({
      data: { text: 'Already done task', status: 'COMPLETED', completedAt: new Date() },
    });

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/v1/tasks/${created.id}`,
      headers: { 'content-type': 'application/json' },
      payload: { status: 'ACTIVE' },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json<{
      task: { id: string; status: string; completedAt: string | null };
    }>();
    expect(body.task.id).toBe(created.id);
    expect(body.task.status).toBe('ACTIVE');
    expect(body.task.completedAt).toBeNull();

    const persisted = await prisma.task.findUnique({ where: { id: created.id } });
    expect(persisted?.status).toBe('ACTIVE');
    expect(persisted?.completedAt).toBeNull();
  });

  it('allows toggling between ACTIVE and COMPLETED multiple times (AC2)', async () => {
    const prisma = getTestPrisma();
    const created = await prisma.task.create({
      data: { text: 'Toggle me', status: 'ACTIVE' },
    });

    // ACTIVE → COMPLETED
    const res1 = await app.inject({
      method: 'PATCH',
      url: `/api/v1/tasks/${created.id}`,
      headers: { 'content-type': 'application/json' },
      payload: { status: 'COMPLETED' },
    });
    expect(res1.statusCode).toBe(200);
    expect(res1.json<{ task: { status: string; completedAt: string | null } }>().task.status).toBe(
      'COMPLETED'
    );
    expect(res1.json<{ task: { completedAt: string | null } }>().task.completedAt).not.toBeNull();

    // COMPLETED → ACTIVE
    const res2 = await app.inject({
      method: 'PATCH',
      url: `/api/v1/tasks/${created.id}`,
      headers: { 'content-type': 'application/json' },
      payload: { status: 'ACTIVE' },
    });
    expect(res2.statusCode).toBe(200);
    expect(res2.json<{ task: { status: string; completedAt: string | null } }>().task.status).toBe(
      'ACTIVE'
    );
    expect(res2.json<{ task: { completedAt: string | null } }>().task.completedAt).toBeNull();
  });

  it('returns 400 when task id is not a valid UUID', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/api/v1/tasks/not-a-valid-uuid',
      headers: { 'content-type': 'application/json' },
      payload: { status: 'COMPLETED' },
    });

    expect(response.statusCode).toBe(400);
    const body = response.json<{ error: string; code: string }>();
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.error).toContain('Invalid task ID');
  });

  it('returns 404 when task id does not exist (AC3)', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/v1/tasks/${nonExistentId}`,
      headers: { 'content-type': 'application/json' },
      payload: { status: 'COMPLETED' },
    });

    expect(response.statusCode).toBe(404);
    const body = response.json<{ error: string; code: string }>();
    expect(body.error).toContain('Task not found');
    expect(body.code).toBe('TASK_NOT_FOUND');
  });

  it('returns 400 when status is an invalid value (AC4)', async () => {
    const prisma = getTestPrisma();
    const created = await prisma.task.create({
      data: { text: 'Some task', status: 'ACTIVE' },
    });

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/v1/tasks/${created.id}`,
      headers: { 'content-type': 'application/json' },
      payload: { status: 'INVALID' },
    });

    expect(response.statusCode).toBe(400);
    const body = response.json<{ error: string; code: string }>();
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.error).toMatch(/ACTIVE|COMPLETED/i);
  });

  it('returns 400 when body contains extra fields (strict schema)', async () => {
    const prisma = getTestPrisma();
    const created = await prisma.task.create({
      data: { text: 'Some task', status: 'ACTIVE' },
    });

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/v1/tasks/${created.id}`,
      headers: { 'content-type': 'application/json' },
      payload: { status: 'COMPLETED', completedAt: '2020-01-01T00:00:00Z' } as Record<
        string,
        unknown
      >,
    });

    expect(response.statusCode).toBe(400);
    const body = response.json<{ code: string }>();
    expect(body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when body is empty (AC4)', async () => {
    const prisma = getTestPrisma();
    const created = await prisma.task.create({
      data: { text: 'Some task', status: 'ACTIVE' },
    });

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/v1/tasks/${created.id}`,
      headers: { 'content-type': 'application/json' },
      payload: {},
    });

    expect(response.statusCode).toBe(400);
    const body = response.json<{ code: string }>();
    expect(body.code).toBe('VALIDATION_ERROR');
  });

  it('response contains all required task fields (AC1)', async () => {
    const prisma = getTestPrisma();
    const created = await prisma.task.create({
      data: { text: 'Full field check', status: 'ACTIVE' },
    });

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/v1/tasks/${created.id}`,
      headers: { 'content-type': 'application/json' },
      payload: { status: 'COMPLETED' },
    });

    expect(response.statusCode).toBe(200);
    const { task } = response.json<{
      task: {
        id: string;
        text: string;
        status: string;
        createdAt: string;
        completedAt: string | null;
      };
    }>();

    expect(task.id).toBe(created.id);
    expect(task.text).toBe('Full field check');
    expect(task.status).toBe('COMPLETED');
    expect(typeof task.createdAt).toBe('string');
    expect(typeof task.completedAt).toBe('string');
  });

  it('returns 500 with generic message when database update fails (AC5)', async () => {
    const prisma = getTestPrisma();
    const created = await prisma.task.create({
      data: { text: 'DB will fail', status: 'ACTIVE' },
    });

    const updateSpy = vi
      .spyOn(app.prisma.task, 'update')
      .mockRejectedValueOnce(new Error('DB connection refused'));

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/v1/tasks/${created.id}`,
      headers: { 'content-type': 'application/json' },
      payload: { status: 'COMPLETED' },
    });

    expect(response.statusCode).toBe(500);
    const body = response.json<{ error: string; requestId: string; path: string }>();
    expect(body.error).toBe('Internal server error');
    expect(body.requestId).toBeDefined();

    // Restore spy before DB check so findUnique uses the real client
    updateSpy.mockRestore();

    // Task status unchanged after DB failure
    const persisted = await prisma.task.findUnique({ where: { id: created.id } });
    expect(persisted?.status).toBe('ACTIVE');
    expect(persisted?.completedAt).toBeNull();
  });
});
