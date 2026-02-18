import Fastify from 'fastify';
import cors from '@fastify/cors';
import { loggerConfig } from './utils/logger';
import { prismaPlugin } from './plugins/prisma';
import { healthRoutes } from './routes/health';
import { buildErrorResponse } from './utils/errorHandler';
import { env } from './config/env';

export async function buildApp() {
  const fastify = Fastify({
    logger: loggerConfig,
    requestIdLogLabel: 'reqId',
    requestIdHeader: 'x-request-id',
  });

  await fastify.register(cors, {
    origin: env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  });

  await fastify.register(prismaPlugin);
  await fastify.register(healthRoutes);

  fastify.setErrorHandler((error, request, reply) => {
    request.log.error(
      {
        err: error,
        method: request.method,
        url: request.url,
        params: request.params,
        query: request.query,
        body: request.body,
      },
      'Request error'
    );
    const { statusCode, body } = buildErrorResponse(error, request.url, request.id);
    void reply.status(statusCode).send(body);
  });

  fastify.addHook('onRequest', async (request) => {
    request.log.info({ method: request.method, url: request.url }, 'Incoming request');
  });

  fastify.addHook('onResponse', async (request, reply) => {
    request.log.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTime: reply.elapsedTime,
      },
      'Request completed'
    );
  });

  return fastify;
}
