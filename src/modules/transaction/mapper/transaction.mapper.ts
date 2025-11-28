import { Transaction } from '@prisma/client';
import { TransactionHistoryResponse } from '../dto/transaction.dto';

export class TransactionMapper {
  static toHistoryResponse(
    userId: string,
    transactions: Transaction[],
  ): TransactionHistoryResponse {
    const sentTransactions = transactions.filter(
      (tx) => tx.fromUserId === userId,
    );
    const receivedTransactions = transactions.filter(
      (tx) => tx.toUserId === userId,
    );

    return {
      userId,
      receivedTransactions,
      sentTransactions,
    };
  }
}

export default TransactionMapper;
