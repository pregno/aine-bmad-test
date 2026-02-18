import type { FastifyInstance } from 'fastify';

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/health', async () => ({
    status: 'healthy' as const,
    timestamp: new Date().toISOString(),
  }));

  fastify.get('/health/detailed', async (request, reply) => {
    let isHealthy = true;
    let dbStatus: string;

    try {
      await fastify.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'up';
    } catch (err) {
      fastify.log.error({ err }, 'Database health check failed');
      dbStatus = 'down';
      isHealthy = false;
    }

    const memUsage = process.memoryUsage();
    const totalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);

    const statusCode = isHealthy ? 200 : 503;
    return reply.code(statusCode).send({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: dbStatus,
        memory: {
          used: usedMB,
          total: totalMB,
          percentage: totalMB > 0 ? Math.round((usedMB / totalMB) * 100) : 0,
        },
      },
    });
  });
}
