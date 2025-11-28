import { z } from 'zod';

export const getUserBalanceParamsSchema = z.object({
  id: z.string().uuid('User ID must be a valid UUID'),
});
