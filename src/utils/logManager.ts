import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
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
  private readonly LOGS_DIR = join(process.cwd(), 'temp', 'logs');

  private constructor() {
    // Ensure logs directory exists
    if (!existsSync(this.LOGS_DIR)) {
      mkdirSync(this.LOGS_DIR, { recursive: true });
    }
  }

  public static getInstance(): LogManager {
    if (!LogManager.instance) {
      LogManager.instance = new LogManager();
    }
    return LogManager.instance;
  }

  private getLogFilePath(
    type: 'audit' | 'error',
    userId?: string,
    transactionId?: string,
  ): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    const dateDir = join(this.LOGS_DIR, dateStr || '');

    if (!existsSync(dateDir)) {
      mkdirSync(dateDir, { recursive: true });
    }

    const fileName = `${type}-${transactionId || 'general'}-${Date.now()}.json`;
    return join(dateDir, fileName);
  }

  private writeLogToFile(filePath: string, logData: AuditLog | ErrorLog): void {
    try {
      const logContent = JSON.stringify(logData, null, 2) + '\n';
      writeFileSync(filePath, logContent, { flag: 'a' });
    } catch (error) {
      console.error('Failed to write log to file:', error);
      console.log('Log data:', logData);
    }
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

    const filePath = this.getLogFilePath(
      'audit',
      data.userId,
      data.transactionId,
    );
    this.writeLogToFile(filePath, auditLog);
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

    if (data.level === 'warn') {
      errorLogger.warn(errorLog, data.message);
    } else {
      errorLogger.error(errorLog, data.message);
    }

    const filePath = this.getLogFilePath(
      'error',
      data.userId,
      data.transactionId,
    );
    this.writeLogToFile(filePath, errorLog);
  }
}
