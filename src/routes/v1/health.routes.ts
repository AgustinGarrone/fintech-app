import { Router, Request, Response } from 'express';
import { JSendBuilderService } from '../../utils/jsendBuilder';
import {
  LATEST_VERSION,
  SUPPORTED_VERSIONS,
} from '../../middleware/versionHandler';

const router = Router();

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check del servidor
 *     description: Verifica el estado del servidor y devuelve información sobre la API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendSuccess'
 *             example:
 *               status: "success"
 *               data:
 *                 server: "running"
 *                 api:
 *                   latestVersion: "v1"
 *                   supportedVersions: ["v1"]
 *               message: "Server is running"
 *               meta:
 *                 timestamp: "2024-01-01T00:00:00.000Z"
 */
router.get('/', (_req: Request, res: Response): Response => {
  const response = JSendBuilderService.success<{
    server: string;
    api: {
      latestVersion: string;
      supportedVersions: string[];
    };
  }>(
    {
      server: 'running',
      api: {
        latestVersion: LATEST_VERSION,
        supportedVersions: [...SUPPORTED_VERSIONS],
      },
    },
    'Server is running',
    { code: 200 },
  );

  return res.status(200).json(response);
});

export default router;
