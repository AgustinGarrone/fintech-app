import { TransactionStatus as TransactionStatusEnum } from '@prisma/client';

export type TransactionEventType =
  | 'withdraw'
  | 'deposit'
  | 'transfer'
  | 'approve'
  | 'reject';

export interface AuditLog {
  type: 'audit';
  event: TransactionEventType;
  transactionId: string;
  userId: string;
  amount: number;
  currency: string;
  previousBalance: number;
  newBalance: number;
  status: TransactionStatusEnum;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorLog {
  type: 'error';
  level: 'error' | 'warn' | 'info';
  message: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  userId?: string;
  transactionId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface SystemLog {
  type: 'system';
  level: 'info' | 'warn' | 'error';
  message: string;
  service: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface CreateAuditLogDto {
  event: TransactionEventType;
  transactionId: string;
  userId: string;
  amount: number;
  currency: string;
  previousBalance: number;
  newBalance: number;
  status: TransactionStatusEnum;
  metadata?: Record<string, unknown>;
}

export interface CreateErrorLogDto {
  level?: 'error' | 'warn' | 'info';
  message: string;
  error?: Error;
  userId?: string;
  transactionId?: string;
  metadata?: Record<string, unknown>;
}

export type LogEntry = AuditLog | ErrorLog | SystemLog;
