import { PrismaClient, User, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../commons/repository/base.repository';
import prisma from '../../../config/database';

export class UserRepository extends BaseRepository<User, Prisma.UserDelegate> {
  private static instance: UserRepository;

  private constructor(client: PrismaClient = prisma) {
    super(client);
  }

  public static getInstance(client?: PrismaClient): UserRepository {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository(client);
    }
    return UserRepository.instance;
  }

  protected getDelegate(client?: PrismaClient): Prisma.UserDelegate {
    return (client ?? this.prisma).user;
  }

  /**
   * Update user balance
   */
  async updateBalance(
    userId: string,
    newBalance: Prisma.Decimal,
    tx?: PrismaClient,
  ): Promise<User> {
    return this.update(
      {
        where: { id: userId },
        data: { balance: newBalance },
      },
      tx,
    );
  }
}

export default UserRepository.getInstance();
