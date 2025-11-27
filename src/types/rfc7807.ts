/**
 * RFC 7807 - Problem Details for HTTP APIs
 * https://tools.ietf.org/html/rfc7807
 */
export interface ProblemDetails {
  /**
   * A URI reference that identifies the problem type
   */
  type: string;

  /**
   * A short, human-readable summary of the problem type
   */
  title: string;

  /**
   * The HTTP status code
   */
  status: number;

  /**
   * A human-readable explanation specific to this occurrence of the problem
   */
  detail?: string;

  /**
   * A URI reference that identifies the specific occurrence of the problem
   */
  instance?: string;

  /**
   * Additional properties that extend the problem details
   */
  [key: string]: unknown;
}
