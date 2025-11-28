import { z } from 'zod';

export const createTransactionSchema = z.object({
  fromUserId: z.string().uuid('fromUserId must be a valid UUID'),
  toUserId: z.string().uuid('toUserId must be a valid UUID'),
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(999999999.99, 'Amount exceeds maximum limit'),
});

export const approveTransactionSchema = z.object({
  id: z.string().uuid('Transaction ID must be a valid UUID'),
});

export const rejectTransactionSchema = z.object({
  id: z.string().uuid('Transaction ID must be a valid UUID'),
});

export const getTransactionsQuerySchema = z.object({
  userId: z.string().uuid('userId must be a valid UUID').optional(),
});
