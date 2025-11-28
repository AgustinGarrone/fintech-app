import { PrismaClient, Prisma, User } from '@prisma/client';
import { BaseService } from '../../../commons/service/base.service';
import userRepository from '../repository/user.repository';

export class UserService extends BaseService<User, Prisma.UserDelegate> {
  private static instance: UserService;

  private constructor() {
    super(userRepository);
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async updateBalance(
    userId: string,
    newBalance: Prisma.Decimal,
    tx?: PrismaClient,
  ): Promise<User> {
    return userRepository.updateBalance(userId, newBalance, tx);
  }

  async getBalance(userId: string, tx?: PrismaClient): Promise<number> {
    const user = await this.findByIdOrFail(userId, tx, 'User');
    return Number(user.balance);
  }
}

export default UserService.getInstance();
