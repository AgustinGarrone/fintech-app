// utils/jsendBuilder.ts
export type JSendStatus = 'success' | 'fail' | 'error';

export interface JSendSuccess<T> {
  status: 'success';
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

export interface JSendFail {
  status: 'fail';
  data: Record<string, string | string[]>;
  message?: string;
  meta?: Record<string, unknown>;
}

export interface JSendError {
  status: 'error';
  message: string;
  code?: number;
  meta?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

/** Singleton JSend Builder */
class JSendBuilder {
  private static instance: JSendBuilder;

  /** Constructor privado para evitar instanciación directa */
  private constructor() {}

  /** Obtener la instancia singleton */
  public static getInstance(): JSendBuilder {
    if (!JSendBuilder.instance) {
      JSendBuilder.instance = new JSendBuilder();
    }
    return JSendBuilder.instance;
  }

  /** Success response */
  public success<T>(
    data: T,
    message?: string,
    meta?: Record<string, unknown>,
  ): JSendSuccess<T> {
    return {
      status: 'success',
      data,
      ...(message && { message }),
      ...(meta && { meta: { ...meta, timestamp: new Date().toISOString() } }),
    };
  }

  /** Created response (201) */
  public created<T>(
    data: T,
    message?: string,
    meta?: Record<string, unknown>,
  ): JSendSuccess<T> {
    return this.success(data, message, meta);
  }

  /** Fail response (400ish) */
  public fail(
    data: Record<string, string | string[]>,
    message?: string,
    meta?: Record<string, unknown>,
  ): JSendFail {
    return {
      status: 'fail',
      data,
      ...(message && { message }),
      ...(meta && { meta: { ...meta, timestamp: new Date().toISOString() } }),
    };
  }

  /** Error response (500ish) */
  public error(
    message: string,
    code?: number,
    meta?: Record<string, unknown>,
  ): JSendError {
    return {
      status: 'error',
      message,
      ...(code && { code }),
      ...(meta && { meta: { ...meta, timestamp: new Date().toISOString() } }),
    };
  }

  /** Success paginated response */
  public successPaginated<T>(
    items: T[],
    pagination: PaginationMeta,
    message?: string,
    additionalMeta?: Record<string, unknown>,
  ): JSendSuccess<PaginatedData<T>> {
    return this.success({ items, pagination }, message, {
      pagination,
      ...additionalMeta,
    });
  }

  /** Helper: create pagination metadata */
  public createPaginationMeta(
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
}

export const JSendBuilderService = JSendBuilder.getInstance();
