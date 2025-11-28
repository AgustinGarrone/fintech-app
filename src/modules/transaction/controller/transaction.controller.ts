import { Request, Response } from 'express';
import TransactionService from '../service/transaction.service';
import { Transaction } from '@prisma/client';
import { TransactionHistoryResponse } from '../dto/transaction.dto';

class TransactionController {
  private readonly transactionService: typeof TransactionService;
  constructor() {
    this.transactionService = TransactionService;
  }
  async create(req: Request, res: Response): Promise<void> {
    const { fromUserId, toUserId, amount } = req.body;

    const transaction = await TransactionService.createTransaction(
      fromUserId,
      toUserId,
      amount,
    );

    res.jsendCreated<Transaction>(
      transaction,
      'Transaction created successfully',
    );
  }

  async getByUserId(req: Request, res: Response): Promise<void> {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      res.jsendFail(
        { userId: 'userId query parameter is required' },
        'Missing required parameter',
        400,
      );
      return;
    }

    const transactionHistory = await TransactionService.getTransactionsByUserId(
      userId,
    );

    res.jsendSuccess<TransactionHistoryResponse>(
      transactionHistory,
      200,
      'Transactions retrieved successfully',
    );
  }

  async approve(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.jsendFail(
        { id: 'Transaction ID is required' },
        'Missing required parameter',
        400,
      );
      return;
    }

    const transaction = await TransactionService.approveTransaction(id);

    res.jsendSuccess<Transaction>(
      transaction,
      200,
      'Transaction approved and processed successfully',
    );
  }

  async reject(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.jsendFail(
        { id: 'Transaction ID is required' },
        'Missing required parameter',
        400,
      );
      return;
    }

    const transaction = await TransactionService.rejectTransaction(id);

    res.jsendSuccess<Transaction>(
      transaction,
      200,
      'Transaction rejected successfully',
    );
  }
}

export default new TransactionController();
