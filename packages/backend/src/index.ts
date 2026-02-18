import { env } from './config/env';
import { buildApp } from './app';

async function start(): Promise<void> {
  try {
    const app = await buildApp();
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    app.log.info(`Server listening on port ${String(env.PORT)} in ${env.NODE_ENV} mode`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

void start();
