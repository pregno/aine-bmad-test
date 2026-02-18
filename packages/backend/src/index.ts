import type { GetTasksResponse } from '@aine/shared';

export type { GetTasksResponse };

const PORT = process.env['PORT'] ?? 3000;

console.log(`Backend service starting on port ${PORT}...`);
console.log('Full implementation in Story 1.3: Backend Foundation with Fastify and Prisma');
