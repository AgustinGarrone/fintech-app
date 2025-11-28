import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

//TODO: ajustar solo al body
export const validate = (
  schema: ZodSchema,
  source: 'body' | 'query' | 'params' = 'body',
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data =
        source === 'body'
          ? req.body
          : source === 'query'
          ? req.query
          : req.params;
      schema.parse(data);
      next();
    } catch (error) {
      next(error);
    }
  };
};
