import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app';
import { getTestPrisma } from '../helpers/testDb';

describe('POST /api/v1/tasks (integration)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 201 with created task when body is valid (AC1)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/tasks',
      headers: { 'content-type': 'application/json' },
      payload: { text: 'Review PR #123' },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json<{
      task: { id: string; text: string; status: string; createdAt: string; completedAt: null };
    }>();
    expect(body.task).toBeDefined();
    expect(body.task.id).toBeDefined();
    expect(body.task.text).toBe('Review PR #123');
    expect(body.task.status).toBe('ACTIVE');
    expect(body.task.createdAt).toBeDefined();
    expect(body.task.completedAt).toBeNull();

    const prisma = getTestPrisma();
    const persisted = await prisma.task.findUnique({ where: { id: body.task.id } });
    expect(persisted).not.toBeNull();
    expect(persisted?.text).toBe('Review PR #123');
    expect(persisted?.status).toBe('ACTIVE');
  });

  it('returns 400 when text is empty (AC2)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/tasks',
      headers: { 'content-type': 'application/json' },
      payload: { text: '' },
    });

    expect(response.statusCode).toBe(400);
    const body = response.json() as Record<string, unknown>;
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.error).toBe('Task text is required');
  });

  it('returns 400 when text is whitespace-only', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/tasks',
      headers: { 'content-type': 'application/json' },
      payload: { text: '   ' },
    });

    expect(response.statusCode).toBe(400);
    const body = response.json() as Record<string, unknown>;
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.error).toBe('Task text is required');
  });

  it('returns 400 when text exceeds 500 characters (AC3)', async () => {
    const longText = 'a'.repeat(501);
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/tasks',
      headers: { 'content-type': 'application/json' },
      payload: { text: longText },
    });

    expect(response.statusCode).toBe(400);
    const body = response.json() as Record<string, unknown>;
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.error).toMatch(/500|characters?/i);
  });

  it('returns 400 when body is missing text field', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/tasks',
      headers: { 'content-type': 'application/json' },
      payload: {},
    });

    expect(response.statusCode).toBe(400);
    const body = response.json<{ error: string; code: string }>();
    expect(body.error).toBe('Task text is required');
    expect(body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 500 with generic message when database create fails (AC4)', async () => {
    const createSpy = vi
      .spyOn(app.prisma.task, 'create')
      .mockRejectedValueOnce(new Error('DB connection refused'));

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/tasks',
      headers: { 'content-type': 'application/json' },
      payload: { text: 'will fail' },
    });

    expect(response.statusCode).toBe(500);
    const body = response.json<{ error: string; requestId: string; path: string }>();
    expect(body.error).toBe('Internal server error');
    expect(body.path).toBe('/api/v1/tasks');
    expect(body.requestId).toBeDefined();
    createSpy.mockRestore();
  });
});
