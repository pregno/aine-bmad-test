import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app';

describe('health routes (integration)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns healthy status', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    const body = response.json<{ status: string; timestamp: string }>();
    expect(body.status).toBe('healthy');
    expect(body.timestamp).toBeDefined();
  });

  it('GET /health/detailed reports database as up', async () => {
    const response = await app.inject({ method: 'GET', url: '/health/detailed' });

    expect(response.statusCode).toBe(200);
    const body = response.json<{
      status: string;
      checks: { database: string; memory: { used: number; total: number } };
    }>();
    expect(body.status).toBe('healthy');
    expect(body.checks.database).toBe('up');
    expect(body.checks.memory.used).toBeGreaterThan(0);
  });
});
