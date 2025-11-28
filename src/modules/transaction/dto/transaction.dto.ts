import { Transaction } from '@prisma/client';

export type TransactionHistoryResponse = {
  userId: string;
  receivedTransactions: Transaction[];
  sentTransactions: Transaction[];
};
