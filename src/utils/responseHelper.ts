import { NextFunction, Response, Request } from 'express';
import {
  JSendSuccessResponse,
  JSendFailResponse,
  PaginationMeta,
  PaginatedData,
} from '../types/jsend';

/**
 * Response Helper Class
 * Provides methods to send standardized JSend responses
 */
export class ResponseHelper {
  /**
   * Send a success response with data
   */
  public static success<T>(
    res: Response,
    data: T,
    statusCode: number = 200,
    message?: string,
    meta?: JSendSuccessResponse<T>['meta'],
  ): Response {
    const response: JSendSuccessResponse<T> = {
      status: 'success',
      data,
      ...(message && { message }),
      ...(meta && { meta: { ...meta, timestamp: new Date().toISOString() } }),
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send a success response with paginated data
   */
  public static successPaginated<T>(
    res: Response,
    items: T[],
    pagination: PaginationMeta,
    statusCode: number = 200,
    message?: string,
    additionalMeta?: Record<string, unknown>,
  ): Response {
    const data: PaginatedData<T> = {
      items,
      pagination,
    };

    return this.success(res, data, statusCode, message, {
      pagination,
      ...additionalMeta,
    });
  }

  /**
   * Send a created response (201)
   */
  public static created<T>(
    res: Response,
    data: T,
    message?: string,
    meta?: JSendSuccessResponse<T>['meta'],
  ): Response {
    return this.success(res, data, 201, message, meta);
  }

  /**
   * Send a no content response (204)
   */
  public static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send a fail response (400)
   * Used when the request is invalid but not a server error
   */
  public static fail(
    res: Response,
    data: Record<string, string | string[]>,
    message?: string,
    statusCode: number = 400,
    meta?: JSendFailResponse['meta'],
  ): Response {
    const response: JSendFailResponse = {
      status: 'fail',
      data,
      ...(message && { message }),
      ...(meta && { meta: { ...meta, timestamp: new Date().toISOString() } }),
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Create pagination metadata from query parameters
   */
  public static createPaginationMeta(
    page: number,
    limit: number,
    total: number,
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Parse pagination query parameters with defaults
   */
  public static parsePagination(
    page?: string | number,
    limit?: string | number,
    defaultLimit: number = 10,
    maxLimit: number = 100,
  ): { page: number; limit: number; skip: number } {
    const parsedPage = Math.max(1, parseInt(String(page || 1), 10) || 1);
    const parsedLimit = Math.min(
      maxLimit,
      Math.max(1, parseInt(String(limit || defaultLimit), 10) || defaultLimit),
    );
    const skip = (parsedPage - 1) * parsedLimit;

    return {
      page: parsedPage,
      limit: parsedLimit,
      skip,
    };
  }
}

/**
 * Express Response extension to add JSend methods
 */
declare global {
  namespace Express {
    interface Response {
      /**
       * Send a JSend success response
       */
      jsendSuccess<T>(
        data: T,
        statusCode?: number,
        message?: string,
        meta?: JSendSuccessResponse<T>['meta'],
      ): Response;

      /**
       * Send a JSend success response with pagination
       */
      jsendSuccessPaginated<T>(
        items: T[],
        pagination: PaginationMeta,
        statusCode?: number,
        message?: string,
        additionalMeta?: Record<string, unknown>,
      ): Response;

      /**
       * Send a JSend created response (201)
       */
      jsendCreated<T>(
        data: T,
        message?: string,
        meta?: JSendSuccessResponse<T>['meta'],
      ): Response;

      /**
       * Send a JSend fail response
       */
      jsendFail(
        data: Record<string, string | string[]>,
        message?: string,
        statusCode?: number,
        meta?: JSendFailResponse['meta'],
      ): Response;
    }
  }
}

/**
 * Middleware to extend Express Response with JSend helper methods
 */
export const jsendMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  res.jsendSuccess = <T>(
    data: T,
    statusCode: number = 200,
    message?: string,
    meta?: JSendSuccessResponse<T>['meta'],
  ) => {
    return ResponseHelper.success(res, data, statusCode, message, meta);
  };

  res.jsendSuccessPaginated = <T>(
    items: T[],
    pagination: PaginationMeta,
    statusCode: number = 200,
    message?: string,
    additionalMeta?: Record<string, unknown>,
  ) => {
    return ResponseHelper.successPaginated(
      res,
      items,
      pagination,
      statusCode,
      message,
      additionalMeta,
    );
  };

  res.jsendCreated = <T>(
    data: T,
    message?: string,
    meta?: JSendSuccessResponse<T>['meta'],
  ) => {
    return ResponseHelper.created(res, data, message, meta);
  };

  res.jsendFail = (
    data: Record<string, string | string[]>,
    message?: string,
    statusCode: number = 400,
    meta?: JSendFailResponse['meta'],
  ) => {
    return ResponseHelper.fail(res, data, message, statusCode, meta);
  };

  next();
};
