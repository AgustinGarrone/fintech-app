import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import 'express-async-errors';
import env from './config/env';
import logger from './config/logger';
import routes from './routes';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import {
  LATEST_VERSION,
  SUPPORTED_VERSIONS,
} from './middleware/versionHandler';

const app = express();

app.use(helmet());
app.use(cors());

// LOGGING
app.use(
  pinoHttp({
    logger,
    customLogLevel: (
      _req: express.Request,
      res: express.Response,
      err?: Error,
    ) => {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        return 'warn';
      } else if (res.statusCode >= 500 || err) {
        return 'error';
      }
      return 'info';
    },
    customSuccessMessage: (req: express.Request, res: express.Response) => {
      return `${req.method} ${req.url} - ${res.statusCode}`;
    },
    customErrorMessage: (
      req: express.Request,
      res: express.Response,
      err: Error,
    ) => {
      return `${req.method} ${req.url} - ${res.statusCode} - ${err.message}`;
    },
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    api: {
      latestVersion: LATEST_VERSION,
      supportedVersions: SUPPORTED_VERSIONS,
    },
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use(notFound);

app.use(errorHandler);

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(
    {
      port: PORT,
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
    `🚀 Server running on port ${PORT}`,
  );
});
