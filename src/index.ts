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
import { jsendMiddleware } from './utils/responseHelper';

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

// JSend response middleware
app.use(jsendMiddleware);

app.get('/health', (_req, res) => {
  res.jsendSuccess(
    {
      server: 'running',
      api: {
        latestVersion: LATEST_VERSION,
        supportedVersions: SUPPORTED_VERSIONS,
      },
    },
    200,
    'Server is running',
  );
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
