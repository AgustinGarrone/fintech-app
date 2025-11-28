import { Prisma, Transaction } from '@prisma/client';
import { BaseService } from '../../../commons/service/base.service';
import { ProblemError } from '../../../errors/ProblemError';
import TransactionRepository from '../repository/transaction.repository';
import UserService from '../../user/service/user.service';
import prisma from '../../../config/database';

export class TransactionService extends BaseService<
  Transaction,
  Prisma.TransactionDelegate
> {
  private static instance: TransactionService;
  private readonly MAX_AUTO_APPROVE_AMOUNT = 50000;

  private constructor() {
    super(TransactionRepository);
  }

  public static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }

  async createTransaction(
    fromUserId: string,
    toUserId: string,
    amount: number,
  ): Promise<Transaction> {
    // Validate users are different
    if (fromUserId === toUserId) {
      throw ProblemError.badRequest(
        'Cannot create transaction to the same user',
      );
    }

    return prisma.$transaction(async (tx) => {
      // Verify both users exist
      const fromUser = await UserService.findByIdOrFail(fromUserId, tx, 'User');
      const toUser = await UserService.findByIdOrFail(toUserId, tx, 'User');

      // Check if origin has sufficient balance
      const fromBalance = Number(fromUser.balance);
      if (fromBalance < amount) {
        throw ProblemError.badRequest('Insufficient balance', {
          currentBalance: fromBalance,
          requiredAmount: amount,
        });
      }

      // Determine status based on amount
      const status =
        amount > this.MAX_AUTO_APPROVE_AMOUNT ? 'PENDING' : 'APPROVED';

      // Create transaction
      const transaction = await this.create(
        {
          data: {
            fromUserId,
            toUserId,
            amount: new Prisma.Decimal(amount),
            status,
          } as any,
        },
        tx,
      );

      // If auto-approved, process the transfer
      if (status === 'APPROVED') {
        await this.processTransfer(fromUser, toUser, amount, tx);
      }

      return transaction;
    });
  }

  /**
   * Get transactions by user ID
   */
  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    return this.findAll(
      {
        where: {
          OR: [{ fromUserId: userId }, { toUserId: userId }],
        } as any,
        orderBy: { createdAt: 'desc' },
        include: {
          fromUser: {
            select: { id: true, name: true, email: true },
          },
          toUser: {
            select: { id: true, name: true, email: true },
          },
        } as any,
      },
      undefined,
    );
  }

  /**
   * Approve a pending transaction
   */
  async approveTransaction(transactionId: string): Promise<Transaction> {
    return prisma.$transaction(async (tx) => {
      const transaction = await this.findByIdOrFail(
        transactionId,
        tx,
        'Transaction',
      );

      // Verify transaction is pending
      const txStatus = (transaction as any).status;
      if (txStatus !== 'PENDING') {
        throw ProblemError.badRequest(
          'Only pending transactions can be approved',
          {
            currentStatus: txStatus,
          },
        );
      }

      // Get users
      const fromUser = await UserService.findByIdOrFail(
        (transaction as any).fromUserId,
        tx,
        'User',
      );
      const toUser = await UserService.findByIdOrFail(
        (transaction as any).toUserId,
        tx,
        'User',
      );

      // Check if origin has sufficient balance
      const amount = Number((transaction as any).amount);
      const fromBalance = Number(fromUser.balance);
      if (fromBalance < amount) {
        throw ProblemError.badRequest('Insufficient balance', {
          currentBalance: fromBalance,
          requiredAmount: amount,
        });
      }

      // Process transfer
      await this.processTransfer(fromUser, toUser, amount, tx);

      // Update transaction status
      return this.update(
        {
          where: { id: transactionId },
          data: { status: 'APPROVED' } as any,
        },
        tx,
      );
    });
  }

  /**
   * Reject a pending transaction
   */
  async rejectTransaction(transactionId: string): Promise<Transaction> {
    const transaction = await this.findByIdOrFail(
      transactionId,
      undefined,
      'Transaction',
    );

    // Verify transaction is pending
    const txStatus = (transaction as any).status;
    if (txStatus !== 'PENDING') {
      throw ProblemError.badRequest(
        'Only pending transactions can be rejected',
        {
          currentStatus: txStatus,
        },
      );
    }

    // Update status to rejected
    return this.update({
      where: { id: transactionId },
      data: { status: 'REJECTED' } as any,
    });
  }

  /**
   * Process the transfer of funds between users
   */
  private async processTransfer(
    fromUser: { id: string; balance: Prisma.Decimal },
    toUser: { id: string; balance: Prisma.Decimal },
    amount: number,
    tx: any,
  ): Promise<void> {
    const fromBalance = Number(fromUser.balance);
    const toBalance = Number(toUser.balance);

    // Update balances
    await UserService.updateBalance(
      fromUser.id,
      new Prisma.Decimal(fromBalance - amount),
      tx,
    );
    await UserService.updateBalance(
      toUser.id,
      new Prisma.Decimal(toBalance + amount),
      tx,
    );
  }
}

export default TransactionService.getInstance();
