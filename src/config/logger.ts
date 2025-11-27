import pino from 'pino';
import env from './env';

const loggerConfig: pino.LoggerOptions = {
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  formatters: {
    level: (label: string) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  }),
};

/**
 * Main application logger
 */
export const logger = pino(loggerConfig);

/**
 * Audit logger for transaction events
 */
export const auditLogger = logger.child({
  type: 'audit',
});

/**
 * Error logger for application errors
 */
export const errorLogger = logger.child({
  type: 'error',
});

/**
 * System logger for system events
 */
export const systemLogger = logger.child({
  type: 'system',
});

export default logger;
