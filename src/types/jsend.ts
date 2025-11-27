/**
 * JSend Specification - A simple, consistent format for JSON responses
 */

/**
 * JSend Response Status
 */
export type JSendStatus = 'success' | 'fail' | 'error';

/**
 * JSend Success Response
 * Used when an API call is successfully executed
 */
export interface JSendSuccessResponse<T = unknown> {
  status: 'success';
  data: T;
  message?: string;
  meta?: {
    timestamp?: string;
    requestId?: string;
    pagination?: PaginationMeta;
    [key: string]: unknown;
  };
}

/**
 * JSend Fail Response
 * Used when an API call is rejected due to invalid data or call conditions
 */
export interface JSendFailResponse {
  status: 'fail';
  data: Record<string, string | string[]> | null;
  message?: string;
  meta?: {
    timestamp?: string;
    requestId?: string;
    [key: string]: unknown;
  };
}

/**
 * JSend Error Response
 * Used when an API call fails due to an error on the server
 */
export interface JSendErrorResponse {
  status: 'error';
  message: string;
  code?: number | string;
  data?: unknown;
  meta?: {
    timestamp?: string;
    requestId?: string;
    [key: string]: unknown;
  };
}

/**
 * Union type for all JSend responses
 */
export type JSendResponse<T = unknown> =
  | JSendSuccessResponse<T>
  | JSendFailResponse
  | JSendErrorResponse;

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated data wrapper
 */
export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}
