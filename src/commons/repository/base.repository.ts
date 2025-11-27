import { PrismaClient } from '@prisma/client';

export abstract class BaseRepository<
  TModel,
  TDelegate extends {
    findMany: (args?: any) => Promise<TModel[]>;
    findUnique: (args: any) => Promise<TModel | null>;
    create: (args: any) => Promise<TModel>;
    update: (args: any) => Promise<TModel>;
    delete: (args: any) => Promise<TModel>;
    count: (args?: any) => Promise<number>;
  },
> {
  constructor(protected readonly prisma: PrismaClient) {}

  /**
   * Get the Prisma delegate for the model
   * Must be implemented by child classes
   */
  protected abstract getDelegate(client?: PrismaClient): TDelegate;

  /**
   * Get delegate, using transaction client if provided
   */
  protected getDelegateWithTx(tx?: PrismaClient): TDelegate {
    return this.getDelegate(tx ?? this.prisma);
  }

  /**
   * Find many records
   */
  findMany(
    args?: Parameters<TDelegate['findMany']>[0],
    tx?: PrismaClient,
  ): Promise<TModel[]> {
    return this.getDelegateWithTx(tx).findMany(args);
  }

  /**
   * Find many records with count
   * Useful for pagination
   */
  async findManyAndCount(
    args?: Parameters<TDelegate['findMany']>[0],
    tx?: PrismaClient,
  ): Promise<[TModel[], number]> {
    const delegate = this.getDelegateWithTx(tx);
    const where = args?.where;
    const take = args?.take;
    const skip = args?.skip;
    const orderBy = args?.orderBy;

    const [data, count] = await Promise.all([
      delegate.findMany({ where, take, skip, orderBy }),
      delegate.count({ where }),
    ]);

    return [data, count];
  }

  /**
   * Find unique record
   */
  findUnique(
    args: Parameters<TDelegate['findUnique']>[0],
    tx?: PrismaClient,
  ): Promise<TModel | null> {
    return this.getDelegateWithTx(tx).findUnique(args);
  }

  /**
   * Create a new record
   */
  create(
    args: Parameters<TDelegate['create']>[0],
    tx?: PrismaClient,
  ): Promise<TModel> {
    return this.getDelegateWithTx(tx).create(args);
  }

  /**
   * Update a record
   */
  update(
    args: Parameters<TDelegate['update']>[0],
    tx?: PrismaClient,
  ): Promise<TModel> {
    return this.getDelegateWithTx(tx).update(args);
  }

  /**
   * Delete a record
   */
  delete(
    args: Parameters<TDelegate['delete']>[0],
    tx?: PrismaClient,
  ): Promise<TModel> {
    return this.getDelegateWithTx(tx).delete(args);
  }

  /**
   * Count records
   */
  count(
    args?: Parameters<TDelegate['count']>[0],
    tx?: PrismaClient,
  ): Promise<number> {
    return this.getDelegateWithTx(tx).count(args);
  }

  /**
   * Check if record exists
   */
  async exists(
    args: Parameters<TDelegate['findUnique']>[0],
    tx?: PrismaClient,
  ): Promise<boolean> {
    const result = await this.findUnique(args, tx);
    return result !== null;
  }
}
