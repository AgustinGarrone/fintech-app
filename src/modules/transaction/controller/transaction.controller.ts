import { Request, Response } from 'express';
import TransactionService from '../service/transaction.service';
import { Transaction } from '@prisma/client';
import { TransactionHistoryResponse } from '../dto/transaction.dto';
import { JSendSuccessResponse, JSendFailResponse } from '../../../types/jsend';
import { JSendBuilderService as JSendBuilder } from '../../../utils/jsendBuilder';

class TransactionController {
  private readonly transactionService: typeof TransactionService;
  constructor() {
    this.transactionService = TransactionService;
  }

  async create(
    req: Request,
    res: Response,
  ): Promise<Response<JSendSuccessResponse<Transaction>>> {
    const { fromUserId, toUserId, amount } = req.body;

    const transaction = await TransactionService.createTransaction(
      fromUserId,
      toUserId,
      amount,
    );

    const response = JSendBuilder.created<Transaction>(
      transaction,
      'Transaction created successfully',
    );

    return res.status(201).json(response);
  }

  async getByUserId(
    req: Request,
    res: Response,
  ): Promise<
    | Response<JSendSuccessResponse<TransactionHistoryResponse>>
    | Response<JSendFailResponse>
  > {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      const response = JSendBuilder.fail(
        { userId: 'userId query parameter is required' },
        'Missing required parameter',
      );
      return res.status(400).json(response);
    }

    const transactionHistory = await TransactionService.getTransactionsByUserId(
      userId,
    );

    const response = JSendBuilder.success<TransactionHistoryResponse>(
      transactionHistory,
      'Transactions retrieved successfully',
    );

    return res.status(200).json(response);
  }

  async approve(
    req: Request,
    res: Response,
  ): Promise<
    Response<JSendSuccessResponse<Transaction>> | Response<JSendFailResponse>
  > {
    const { id } = req.params;

    if (!id) {
      const response = JSendBuilder.fail(
        { id: 'Transaction ID is required' },
        'Missing required parameter',
      );
      return res.status(400).json(response);
    }

    const transaction = await TransactionService.approveTransaction(id);

    const response = JSendBuilder.success<Transaction>(
      transaction,
      'Transaction approved and processed successfully',
    );

    return res.status(200).json(response);
  }

  async reject(
    req: Request,
    res: Response,
  ): Promise<
    Response<JSendSuccessResponse<Transaction>> | Response<JSendFailResponse>
  > {
    const { id } = req.params;

    if (!id) {
      const response = JSendBuilder.fail(
        { id: 'Transaction ID is required' },
        'Missing required parameter',
      );
      return res.status(400).json(response);
    }

    const transaction = await TransactionService.rejectTransaction(id);

    const response = JSendBuilder.success<Transaction>(
      transaction,
      'Transaction rejected successfully',
    );

    return res.status(200).json(response);
  }
}

export default new TransactionController();
