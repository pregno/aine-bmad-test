import pino from 'pino';

const isDevelopment = process.env['NODE_ENV'] === 'development';

const sharedConfig = {
  level: process.env['LOG_LEVEL'] ?? 'info',
  formatters: {
    level: (label: string) => ({ level: label.toUpperCase() }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

const devTransportConfig = {
  ...sharedConfig,
  transport: {
    target: 'pino-pretty' as const,
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
};

export const loggerConfig = isDevelopment ? devTransportConfig : sharedConfig;

export const logger = pino(loggerConfig);
