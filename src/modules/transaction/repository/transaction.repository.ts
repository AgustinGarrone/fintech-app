import { PrismaClient, Transaction, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../commons/repository/base.repository';
import prisma from '../../../config/database';

export class TransactionRepository extends BaseRepository<
  Transaction,
  Prisma.TransactionDelegate
> {
  private static instance: TransactionRepository;

  private constructor(client: PrismaClient = prisma) {
    super(client);
  }

  public static getInstance(client?: PrismaClient): TransactionRepository {
    if (!TransactionRepository.instance) {
      TransactionRepository.instance = new TransactionRepository(client);
    }
    return TransactionRepository.instance;
  }

  protected getDelegate(client?: PrismaClient): Prisma.TransactionDelegate {
    return (client ?? this.prisma).transaction;
  }
}

// Export singleton instance
export default TransactionRepository.getInstance();
