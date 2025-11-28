import { PrismaClient } from '@prisma/client';

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;
import { BaseRepository } from '../repository/base.repository';
import { ProblemError } from '../../errors/ProblemError';

export abstract class BaseService<
  TModel extends { id: string },
  TDelegate extends {
    findMany: (args?: any) => Promise<TModel[]>;
    findUnique: (args: any) => Promise<TModel | null>;
    create: (args: any) => Promise<TModel>;
    update: (args: any) => Promise<TModel>;
    delete: (args: any) => Promise<TModel>;
    count: (args?: any) => Promise<number>;
  },
> {
  constructor(
    protected readonly repository: BaseRepository<TModel, TDelegate>,
  ) {}

  /**
   * Find all records
   */
  async findAll(
    args?: Parameters<TDelegate['findMany']>[0],
    tx?: PrismaClient | TransactionClient,
  ): Promise<TModel[]> {
    return this.repository.findMany(args, tx as any);
  }

  /**
   * Find one record
   */
  async findOne(
    args: Parameters<TDelegate['findUnique']>[0],
    tx?: PrismaClient | TransactionClient,
  ): Promise<TModel | null> {
    return this.repository.findUnique(args, tx as any);
  }

  /**
   * Find by ID or throw error if not found
   */
  async findByIdOrFail(
    id: string,
    tx?: PrismaClient | TransactionClient,
    resourceName: string = 'Resource',
  ): Promise<TModel> {
    const result = await this.repository.findUnique(
      { where: { id } },
      tx as any,
    );
    if (!result) {
      throw ProblemError.notFound(`${resourceName} with id ${id} not found`, {
        resourceId: id,
        resourceType: resourceName,
      });
    }
    return result;
  }

  /**
   * Find one or throw error if not found
   */
  async findOneOrFail(
    args: Parameters<TDelegate['findUnique']>[0],
    tx?: PrismaClient | TransactionClient,
    resourceName: string = 'Resource',
  ): Promise<TModel> {
    const result = await this.repository.findUnique(args, tx as any);
    if (!result) {
      throw ProblemError.notFound(`${resourceName} not found`, {
        resourceType: resourceName,
      });
    }
    return result;
  }

  /**
   * Create a new record
   */
  async create(
    args: Parameters<TDelegate['create']>[0],
    tx?: PrismaClient | TransactionClient,
  ): Promise<TModel> {
    return this.repository.create(args, tx as any);
  }

  /**
   * Update a record
   */
  async update(
    args: Parameters<TDelegate['update']>[0],
    tx?: PrismaClient | TransactionClient,
  ): Promise<TModel> {
    return this.repository.update(args, tx as any);
  }

  /**
   * Delete a record
   */
  async delete(
    args: Parameters<TDelegate['delete']>[0],
    tx?: PrismaClient | TransactionClient,
  ): Promise<TModel> {
    return this.repository.delete(args, tx as any);
  }

  /**
   * Count records
   */
  async count(
    args?: Parameters<TDelegate['count']>[0],
    tx?: PrismaClient | TransactionClient,
  ): Promise<number> {
    return this.repository.count(args, tx as any);
  }

  /**
   * Check if record exists
   */
  async exists(
    args: Parameters<TDelegate['findUnique']>[0],
    tx?: PrismaClient | TransactionClient,
  ): Promise<boolean> {
    return this.repository.exists(args, tx as any);
  }

  /**
   * Find many with count (for pagination)
   */
  async findManyAndCount(
    args?: Parameters<TDelegate['findMany']>[0],
    tx?: PrismaClient | TransactionClient,
  ): Promise<[TModel[], number]> {
    return this.repository.findManyAndCount(args, tx as any);
  }
}
