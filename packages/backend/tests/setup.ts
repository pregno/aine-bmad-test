/**
 * Vitest setup file for integration tests.
 *
 * Placeholder DATABASE_URL prevents env.ts from calling process.exit(1)
 * during module evaluation. The real URL is set once Testcontainers
 * starts the PostgreSQL container in beforeAll.
 */
process.env['DATABASE_URL'] ??= 'postgresql://placeholder:placeholder@localhost:5432/placeholder';

import { beforeAll, afterAll, afterEach } from 'vitest';
import { startTestDatabase, cleanTestDatabase, stopTestDatabase } from './helpers/testDb';

beforeAll(async () => {
  await startTestDatabase();
}, 120_000);

afterEach(async () => {
  await cleanTestDatabase();
});

afterAll(async () => {
  await stopTestDatabase();
});
