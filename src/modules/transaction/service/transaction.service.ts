import {
  Prisma,
  Transaction,
  TransactionStatus as TransactionStatusEnum,
} from '@prisma/client';
import { BaseService } from '../../../commons/service/base.service';
import { ProblemError } from '../../../errors/ProblemError';
import TransactionRepository from '../repository/transaction.repository';
import UserService from '../../user/service/user.service';
import prisma from '../../../config/database';
import TransactionMapper from '../mapper/transaction.mapper';
import { TransactionHistoryResponse } from '../dto/transaction.dto';
import { LogManager } from '../../../utils/logManager';

export class TransactionService extends BaseService<
  Transaction,
  Prisma.TransactionDelegate
> {
  private static instance: TransactionService;
  private readonly MAX_AUTO_APPROVE_AMOUNT = 50000;
  private readonly logManager: LogManager;

  private constructor() {
    super(TransactionRepository);
    this.logManager = LogManager.getInstance();
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
      const [fromUser, toUser] = await Promise.all([
        UserService.findByIdOrFail(fromUserId, tx, 'User'),
        UserService.findByIdOrFail(toUserId, tx, 'User'),
      ]);

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
        amount > this.MAX_AUTO_APPROVE_AMOUNT
          ? TransactionStatusEnum.PENDING
          : TransactionStatusEnum.APPROVED;

      // Create transaction
      const transaction = await this.create(
        {
          data: {
            fromUserId,
            toUserId,
            amount: new Prisma.Decimal(amount),
            status: status as string,
          } as unknown as Prisma.TransactionCreateInput,
        },
        tx,
      );
      if (status === TransactionStatusEnum.APPROVED) {
        await this.processTransfer(
          fromUser,
          toUser,
          amount,
          transaction.id,
          tx,
        );
      }

      return transaction;
    });
  }

  async getTransactionsByUserId(
    userId: string,
  ): Promise<TransactionHistoryResponse> {
    const transactions = await this.findAll(
      {
        where: {
          OR: [{ fromUserId: userId }, { toUserId: userId }],
        } as Prisma.TransactionWhereInput,
        orderBy: { createdAt: 'desc' },
        include: {
          fromUser: {
            select: { id: true, name: true, email: true },
          },
          toUser: {
            select: { id: true, name: true, email: true },
          },
        } as Prisma.TransactionInclude,
      },
      undefined,
    );

    return TransactionMapper.toHistoryResponse(userId, transactions);
  }

  async approveTransaction(transactionId: string): Promise<Transaction> {
    return prisma.$transaction(async (tx) => {
      const transaction = await this.findByIdOrFail(
        transactionId,
        tx,
        'Transaction',
      );

      // Verify transaction is pending
      const txStatus = transaction.status;
      if (txStatus !== TransactionStatusEnum.PENDING) {
        throw ProblemError.badRequest(
          'Only pending transactions can be approved',
          {
            currentStatus: txStatus,
          },
        );
      }

      const [fromUser, toUser] = await Promise.all([
        UserService.findByIdOrFail(transaction.fromUserId, tx, 'User'),
        UserService.findByIdOrFail(transaction.toUserId, tx, 'User'),
      ]);

      const amount = Number(transaction.amount);
      const fromBalance = Number(fromUser.balance);
      if (fromBalance < amount) {
        throw ProblemError.badRequest('Insufficient balance', {
          currentBalance: fromBalance,
          requiredAmount: amount,
        });
      }

      // Process transfer
      await this.processTransfer(fromUser, toUser, amount, transactionId, tx);

      // Update transaction status
      return this.update(
        {
          where: { id: transactionId },
          data: {
            status: TransactionStatusEnum.APPROVED,
          } as Prisma.TransactionUpdateInput,
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
    const txStatus = transaction.status;
    if (txStatus !== TransactionStatusEnum.PENDING) {
      throw ProblemError.badRequest(
        'Only pending transactions can be rejected',
        {
          currentStatus: txStatus,
        },
      );
    }

    return this.update({
      where: { id: transactionId },
      data: { status: TransactionStatusEnum.REJECTED },
    });
  }

  private async processTransfer(
    fromUser: { id: string; balance: Prisma.Decimal; version: number },
    toUser: { id: string; balance: Prisma.Decimal; version: number },
    amount: number,
    transactionId: string,
    tx: any,
  ): Promise<void> {
    const fromBalance = Number(fromUser.balance);
    const toBalance = Number(toUser.balance);

    try {
      const fromUserUpdated = await tx.user.updateMany({
        where: {
          id: fromUser.id,
          version: fromUser.version,
        },
        data: {
          balance: new Prisma.Decimal(fromBalance - amount),
          version: { increment: 1 },
        },
      });

      if (fromUserUpdated.count === 0) {
        const error = ProblemError.conflict(
          'El saldo del usuario emisor fue modificado. Por favor, reintenta la transacción.',
          {
            userId: fromUser.id,
            expectedVersion: fromUser.version,
          },
        );

        this.logManager.logError({
          level: 'warn',
          message:
            'Error al procesar transferencia: conflicto de versión en usuario emisor',
          error: error,
          userId: fromUser.id,
          transactionId: transactionId,
          metadata: {
            fromUserId: fromUser.id,
            toUserId: toUser.id,
            amount,
            expectedVersion: fromUser.version,
          },
        });

        throw error;
      }

      const toUserUpdated = await tx.user.updateMany({
        where: {
          id: toUser.id,
          version: toUser.version,
        },
        data: {
          balance: new Prisma.Decimal(toBalance + amount),
          version: { increment: 1 },
        },
      });

      if (toUserUpdated.count === 0) {
        const error = ProblemError.conflict(
          'El saldo del usuario receptor fue modificado. Por favor, reintenta la transacción.',
          {
            userId: toUser.id,
            expectedVersion: toUser.version,
          },
        );

        this.logManager.logError({
          level: 'warn',
          message:
            'Error al procesar transferencia: conflicto de versión en usuario receptor',
          error: error,
          userId: fromUser.id,
          transactionId: transactionId,
          metadata: {
            fromUserId: fromUser.id,
            toUserId: toUser.id,
            amount,
            expectedVersion: toUser.version,
          },
        });

        throw error;
      }

      this.logManager.logTransaction({
        event: 'transfer',
        transactionId: transactionId,
        userId: fromUser.id,
        amount,
        currency: 'ARS',
        previousBalance: fromBalance,
        newBalance: fromBalance - amount,
        status: TransactionStatusEnum.APPROVED,
        metadata: {
          success: true,
          toUserId: toUser.id,
        },
      });
    } catch (error) {
      if (error instanceof ProblemError) {
        throw error;
      }
      throw error;
    }
  }
}

export default TransactionService.getInstance();
