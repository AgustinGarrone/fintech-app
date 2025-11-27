import { auditLogger as pinoAuditLogger, errorLogger } from '../config/logger';
import {
  AuditLog,
  CreateAuditLogDto,
  CreateErrorLogDto,
  ErrorLog,
} from '../types/auditLog';

/**
 * General utility class for generating audit and error logs
 */
export class LogManager {
  private static instance: LogManager;

  private constructor() {}

  public static getInstance(): LogManager {
    if (!LogManager.instance) {
      LogManager.instance = new LogManager();
    }
    return LogManager.instance;
  }

  /**
   * Log transaction audit event
   */
  public logTransaction(data: CreateAuditLogDto): void {
    const auditLog: AuditLog = {
      type: 'audit',
      event: data.event,
      transactionId: data.transactionId,
      userId: data.userId,
      amount: data.amount,
      currency: data.currency,
      previousBalance: data.previousBalance,
      newBalance: data.newBalance,
      status: data.status,
      timestamp: new Date().toISOString(),
      metadata: data.metadata,
    };

    pinoAuditLogger.info(
      auditLog,
      `Transaction ${data.event}: ${data.transactionId}`,
    );
  }

  /**
   * Log application error
   */
  public logError(data: CreateErrorLogDto): void {
    const errorLog: ErrorLog = {
      type: 'error',
      level: data.level || 'error',
      message: data.message,
      error: data.error
        ? {
            name: data.error.name,
            message: data.error.message,
            stack: data.error.stack,
          }
        : undefined,
      userId: data.userId,
      transactionId: data.transactionId,
      timestamp: new Date().toISOString(),
      metadata: data.metadata,
    };

    const logMethod =
      data.level === 'warn' ? errorLogger.warn : errorLogger.error;
    logMethod(errorLog, data.message);
  }
}
