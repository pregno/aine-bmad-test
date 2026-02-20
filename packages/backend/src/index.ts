import { env } from './config/env';
import { buildApp } from './app';
import { startAutoDeleteScheduler } from './jobs/autoDeleteScheduler';

async function start(): Promise<void> {
  try {
    const app = await buildApp();

    // Start auto-delete scheduler; failure here must not prevent the HTTP server from starting (AC6)
    try {
      const scheduledTask = startAutoDeleteScheduler(app.prisma, app.log, env.AUTO_DELETE_CRON);
      app.addHook('onClose', async () => {
        scheduledTask.stop();
      });
    } catch (err) {
      app.log.error(
        { err },
        'Failed to register auto-delete scheduler; server continues without it'
      );
    }

    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    app.log.info(`Server listening on port ${String(env.PORT)} in ${env.NODE_ENV} mode`);

    const shutdown = (): void => {
      void app.close().then(() => process.exit(0));
    };
    process.once('SIGTERM', shutdown);
    process.once('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

void start();
