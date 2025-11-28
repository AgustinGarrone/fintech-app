import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ProblemError } from '../errors/ProblemError';
import env from '../config/env';
import { LogManager } from '../utils/logManager';

const logManager = LogManager.getInstance();

/**
 * Helper to send RFC 7807 problem response
 */
const sendProblem = (res: Response, problem: ProblemError): void => {
  res.status(problem.status);
  res.setHeader('Content-Type', 'application/problem+json');
  res.json(problem.toJSON());
};

/**
 * Maps Prisma error codes to HTTP status codes and error types
 */
const mapPrismaError = (
  err: Prisma.PrismaClientKnownRequestError,
): ProblemError => {
  const code = err.code;
  const message = err.message;
  const meta = err.meta || {};

  // Common Prisma error patterns
  if (code === 'P2025') {
    return ProblemError.notFound(message || 'Record not found', {
      code,
      ...meta,
    });
  }

  if (code === 'P2002') {
    return ProblemError.conflict(
      message || 'A record with this value already exists',
      {
        code,
        field: (meta.target as string[]) || [],
        ...meta,
      },
    );
  }

  // Client errors (P20xx) - Bad Request
  if (code.startsWith('P20')) {
    return ProblemError.badRequest(message || 'Database operation failed', {
      code,
      ...meta,
    });
  }

  // Default for unknown Prisma errors
  return ProblemError.badRequest(message || 'Database operation failed', {
    code,
    ...meta,
  });
};

/**
 * Global error handler middleware that formats errors according to RFC 7807
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Already a ProblemError
  if (err instanceof ProblemError) {
    logManager.logError({
      level: err.status >= 500 ? 'error' : 'warn',
      message: err.message,
      metadata: {
        status: err.status,
      },
    });
    return sendProblem(res, err);
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    logManager.logError({
      level: 'warn',
      message: 'Validation failed',
      metadata: {
        errors: err.errors,
      },
    });
    return sendProblem(
      res,
      ProblemError.unprocessableEntity('Validation failed', {
        errors: err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
          code: e.code,
        })),
      }),
    );
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logManager.logError({
      level: 'error',
      message: 'Database error',
      error: err,
      metadata: {
        code: err.code,
        meta: err.meta,
      },
    });
    return sendProblem(res, mapPrismaError(err));
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    logManager.logError({
      level: 'error',
      message: 'Database validation error',
      error: err,
    });
    return sendProblem(
      res,
      ProblemError.badRequest(err.message || 'Invalid data provided'),
    );
  }

  // Unknown errors
  logManager.logError({
    level: 'error',
    message: 'Unexpected error occurred',
    error: err,
    metadata: {
      name: err.name,
      stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });

  const detail =
    env.NODE_ENV === 'production'
      ? 'An internal server error occurred'
      : err.message || 'An unexpected error occurred';

  return sendProblem(
    res,
    ProblemError.internalServerError(detail, {
      ...(env.NODE_ENV === 'development' && {
        stack: err.stack,
        name: err.name,
      }),
    }),
  );
};
