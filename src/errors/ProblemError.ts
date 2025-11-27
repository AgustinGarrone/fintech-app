import { ProblemDetails } from '../types/rfc7807';

/**
 * Base URL for problem types
 */
const PROBLEM_TYPE_BASE = 'https://api.fintech.com/problems';

/**
 * Default problem types by HTTP status code
 */
const DEFAULT_PROBLEM_TYPES: Record<number, string> = {
  400: `${PROBLEM_TYPE_BASE}/bad-request`,
  401: `${PROBLEM_TYPE_BASE}/unauthorized`,
  403: `${PROBLEM_TYPE_BASE}/forbidden`,
  404: `${PROBLEM_TYPE_BASE}/not-found`,
  409: `${PROBLEM_TYPE_BASE}/conflict`,
  422: `${PROBLEM_TYPE_BASE}/unprocessable-entity`,
  500: `${PROBLEM_TYPE_BASE}/internal-server-error`,
};

/**
 * Default titles by HTTP status code
 */
const DEFAULT_TITLES: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  500: 'Internal Server Error',
};

/**
 * ProblemError class that implements RFC 7807 Problem Details
 */
export class ProblemError extends Error {
  public readonly status: number;
  public readonly title: string;
  public readonly type: string;
  public readonly detail?: string;
  public readonly instance?: string;
  public readonly extensions: Record<string, unknown>;

  constructor(
    status: number,
    title: string,
    detail?: string,
    options?: {
      type?: string;
      instance?: string;
      extensions?: Record<string, unknown>;
    },
  ) {
    super(detail || title);
    this.name = 'ProblemError';
    this.status = status;
    this.title = title || DEFAULT_TITLES[status] || 'Error';
    this.type =
      options?.type ||
      DEFAULT_PROBLEM_TYPES[status] ||
      `${PROBLEM_TYPE_BASE}/error`;
    this.detail = detail;
    this.instance = options?.instance;
    this.extensions = options?.extensions || {};

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ProblemError);
    }
  }

  /**
   * Convert the error to RFC 7807 Problem Details format
   */
  toJSON(): ProblemDetails {
    const problem: ProblemDetails = {
      type: this.type,
      title: this.title,
      status: this.status,
    };

    if (this.detail) {
      problem.detail = this.detail;
    }

    if (this.instance) {
      problem.instance = this.instance;
    }

    // Add extensions
    Object.keys(this.extensions).forEach((key) => {
      problem[key] = this.extensions[key];
    });

    return problem;
  }

  /**
   * Create a Bad Request error (400)
   */
  static badRequest(
    detail?: string,
    extensions?: Record<string, unknown>,
  ): ProblemError {
    return new ProblemError(400, 'Bad Request', detail, { extensions });
  }

  /**
   * Create an Unauthorized error (401)
   */
  static unauthorized(
    detail?: string,
    extensions?: Record<string, unknown>,
  ): ProblemError {
    return new ProblemError(401, 'Unauthorized', detail, { extensions });
  }

  /**
   * Create a Forbidden error (403)
   */
  static forbidden(
    detail?: string,
    extensions?: Record<string, unknown>,
  ): ProblemError {
    return new ProblemError(403, 'Forbidden', detail, { extensions });
  }

  /**
   * Create a Not Found error (404)
   */
  static notFound(
    detail?: string,
    extensions?: Record<string, unknown>,
  ): ProblemError {
    return new ProblemError(404, 'Not Found', detail, { extensions });
  }

  /**
   * Create a Conflict error (409)
   */
  static conflict(
    detail?: string,
    extensions?: Record<string, unknown>,
  ): ProblemError {
    return new ProblemError(409, 'Conflict', detail, { extensions });
  }

  /**
   * Create an Unprocessable Entity error (422)
   */
  static unprocessableEntity(
    detail?: string,
    extensions?: Record<string, unknown>,
  ): ProblemError {
    return new ProblemError(422, 'Unprocessable Entity', detail, {
      extensions,
    });
  }

  /**
   * Create an Internal Server Error (500)
   */
  static internalServerError(
    detail?: string,
    extensions?: Record<string, unknown>,
  ): ProblemError {
    return new ProblemError(500, 'Internal Server Error', detail, {
      extensions,
    });
  }
}
