import swaggerJsdoc from 'swagger-jsdoc';
import {
  LATEST_VERSION,
  SUPPORTED_VERSIONS,
} from '../middleware/versionHandler';
import env from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fintech API',
      version: LATEST_VERSION,
      description: 'API para gestión de transacciones financieras',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Transactions',
        description: 'Endpoints para gestión de transacciones',
      },
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
    ],
    components: {
      schemas: {
        Transaction: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único de la transacción',
            },
            fromUserId: {
              type: 'string',
              format: 'uuid',
              description: 'ID del usuario origen',
            },
            toUserId: {
              type: 'string',
              format: 'uuid',
              description: 'ID del usuario destino',
            },
            amount: {
              type: 'number',
              format: 'decimal',
              description: 'Monto de la transacción',
              example: 1000.5,
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'APPROVED', 'REJECTED'],
              description: 'Estado de la transacción',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización',
            },
            fromUser: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                email: { type: 'string' },
              },
            },
            toUser: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                email: { type: 'string' },
              },
            },
          },
          required: ['id', 'fromUserId', 'toUserId', 'amount', 'status'],
        },
        CreateTransactionRequest: {
          type: 'object',
          required: ['fromUserId', 'toUserId', 'amount'],
          properties: {
            fromUserId: {
              type: 'string',
              format: 'uuid',
              description: 'ID del usuario origen',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            toUserId: {
              type: 'string',
              format: 'uuid',
              description: 'ID del usuario destino',
              example: '123e4567-e89b-12d3-a456-426614174001',
            },
            amount: {
              type: 'number',
              minimum: 0.01,
              maximum: 999999999.99,
              description: 'Monto de la transacción',
              example: 1000.5,
            },
          },
        },
        JSendSuccess: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['success'],
              example: 'success',
            },
            data: {
              type: 'object',
              description: 'Datos de la respuesta',
            },
            message: {
              type: 'string',
              description: 'Mensaje opcional',
            },
            meta: {
              type: 'object',
              properties: {
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                },
              },
            },
          },
          required: ['status', 'data'],
        },
        JSendFail: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['fail'],
              example: 'fail',
            },
            data: {
              type: 'object',
              description: 'Errores de validación',
            },
            message: {
              type: 'string',
              description: 'Mensaje de error',
            },
          },
          required: ['status', 'data'],
        },
        ProblemDetails: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              format: 'uri',
              description: 'Tipo de problema',
            },
            title: {
              type: 'string',
              description: 'Título del problema',
            },
            status: {
              type: 'number',
              description: 'Código de estado HTTP',
            },
            detail: {
              type: 'string',
              description: 'Detalle del problema',
            },
            instance: {
              type: 'string',
              format: 'uri',
              description: 'Instancia del problema',
            },
          },
          required: ['type', 'title', 'status'],
        },
      },
      parameters: {
        VersionHeader: {
          name: 'X-API-Version',
          in: 'header',
          description: 'Versión de la API',
          schema: {
            type: 'string',
            enum: SUPPORTED_VERSIONS,
            default: LATEST_VERSION,
          },
        },
        VersionQuery: {
          name: 'version',
          in: 'query',
          description: 'Versión de la API',
          schema: {
            type: 'string',
            enum: SUPPORTED_VERSIONS,
            default: LATEST_VERSION,
          },
        },
      },
    },
  },
  apis: ['./src/routes/**/*.ts', './src/modules/**/controller/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
