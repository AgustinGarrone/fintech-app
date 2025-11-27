import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import env from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import {
  LATEST_VERSION,
  SUPPORTED_VERSIONS,
} from './middleware/versionHandler';

const app = express();

app.use(helmet());
app.use(cors());

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

// Error handler
app.use(errorHandler);

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
