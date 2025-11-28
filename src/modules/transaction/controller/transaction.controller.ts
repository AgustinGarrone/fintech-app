import { Request, Response } from 'express';
import TransactionService from '../service/transaction.service';
import { Transaction } from '@prisma/client';

class TransactionController {
  /**
   * POST /transactions
   * Create a transaction between two users
   */
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

  /**
   * GET /transactions?userId=''
   * Get transactions by user ID
   */
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

    const transactions = await TransactionService.getTransactionsByUserId(
      userId,
    );

    res.jsendSuccess<Transaction[]>(
      transactions,
      200,
      'Transactions retrieved successfully',
    );
  }

  /**
   * PATCH /transactions/:id/approve
   * Approve a pending transaction
   */
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

  /**
   * PATCH /transactions/:id/reject
   * Reject a pending transaction
   */
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
