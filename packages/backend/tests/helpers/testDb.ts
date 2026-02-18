import { GenericContainer, type StartedTestContainer } from 'testcontainers';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const BACKEND_ROOT = resolve(__dirname, '../..');

let container: StartedTestContainer | undefined;
let prismaClient: PrismaClient | undefined;
let dbUrl: string | undefined;

function runPrismaAgainstTestDb(command: string, databaseUrl: string): void {
  execSync(command, {
    cwd: BACKEND_ROOT,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'pipe',
  });
}

export async function startTestDatabase(): Promise<{
  prisma: PrismaClient;
  databaseUrl: string;
}> {
  container = await new GenericContainer('postgres:16-alpine')
    .withExposedPorts(5432)
    .withEnvironment({
      POSTGRES_USER: 'test',
      POSTGRES_PASSWORD: 'test',
      POSTGRES_DB: 'test_db',
    })
    .start();

  const port = container.getMappedPort(5432);
  const host = container.getHost();
  dbUrl = `postgresql://test:test@${host}:${port}/test_db`;

  process.env['DATABASE_URL'] = dbUrl;

  try {
    // Preferred path for stable schema evolution in tests.
    runPrismaAgainstTestDb('npx prisma migrate deploy', dbUrl);
  } catch {
    // Bootstrap fallback while migration files are still being introduced.
    runPrismaAgainstTestDb('npx prisma db push --skip-generate --accept-data-loss', dbUrl);
  }

  prismaClient = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  await prismaClient.$connect();

  return { prisma: prismaClient, databaseUrl: dbUrl };
}

export async function cleanTestDatabase(): Promise<void> {
  if (prismaClient) {
    await prismaClient.task.deleteMany();
  }
}

export async function stopTestDatabase(): Promise<void> {
  if (prismaClient) {
    await prismaClient.$disconnect();
    prismaClient = undefined;
  }
  if (container) {
    await container.stop();
    container = undefined;
  }
  dbUrl = undefined;
}

export function getTestPrisma(): PrismaClient {
  if (!prismaClient) throw new Error('Test database not started. Call startTestDatabase() first.');
  return prismaClient;
}

export function getTestDatabaseUrl(): string {
  if (!dbUrl) throw new Error('Test database not started. Call startTestDatabase() first.');
  return dbUrl;
}
